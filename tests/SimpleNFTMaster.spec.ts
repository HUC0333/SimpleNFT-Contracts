import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { CollectionMintMsg, SimpleNFTMaster } from '../wrappers/SimpleNFTMaster';

import '@ton/test-utils';

describe('SimpleNFTMaster', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let simpleNFTMaster: SandboxContract<SimpleNFTMaster>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        simpleNFTMaster = blockchain.openContract(await SimpleNFTMaster.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await simpleNFTMaster.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: simpleNFTMaster.address,
            deploy: true,
            success: true,
        });

        await simpleNFTMaster.send(
            deployer.getSender(),
            {
                value: toNano("500")
            }, "deposit"
        );

        console.log("Start balance", await simpleNFTMaster.getBalance())
    });

     it('should cost', async() => {
        console.log("Getting");

        const price = await simpleNFTMaster.getGetCreationCost();
        console.log("Price: ", price)
        expect(price >=1);
     })


     it('should mint', async () => {

        const mintMessage: CollectionMintMsg = {
            $$type: "CollectionMintMsg",
            owner: deployer.getSender().address,
            itemPrice: 5000000000n,
            mintLimit: 10000n, 
            saleable: false, 
            editable: false,
            title: "Candyman", 
            image: "example.png", 
            metadata: JSON.stringify({damage: 1})
        }
        console.log("Before mint: ", await simpleNFTMaster.getBalance())
        console.log("Sending: ", 1500000000n)
        const res = await simpleNFTMaster.send(deployer.getSender(), {
            value: 150000000n
        }, mintMessage);
        // console.log("Res: ", res);
        console.log("After mint: ", await simpleNFTMaster.getBalance())

        console.log("deployer - ", deployer.getSender().address)
        console.log("nftMaster - ", simpleNFTMaster.address)

        
        const nftCollectionAddress = await simpleNFTMaster.getGetCollectionAddress(
        0n, 
        mintMessage.owner, 
        mintMessage.itemPrice, 
        mintMessage.mintLimit, 
        mintMessage.saleable, 
        mintMessage.editable, 
        mintMessage.title, 
        mintMessage.image, 
        mintMessage.metadata);
        console.log("nftItemAddress - ", nftCollectionAddress)
        
       });

      it('should withdraw', async() => {
        const user = await blockchain.treasury('user');
        
        const balanceBeforeUser = await user.getBalance()
        console.log("Before: ", balanceBeforeUser);

        await simpleNFTMaster.send(user.getSender(), {
            value: toNano("0.2")
        }, "withdraw")

        const balanceAfterUser = await user.getBalance()
        console.log("After: ", balanceAfterUser);

        expect(balanceBeforeUser).toBeGreaterThanOrEqual(balanceAfterUser)

        const balanceBeforeDeployer = await deployer.getBalance()

        await simpleNFTMaster.send(deployer.getSender(), {
            value: toNano("0.2")
        }, 'withdraw')

        const balanceAfterDeployer = await deployer.getBalance()

        expect(balanceAfterDeployer).toBeGreaterThan(balanceBeforeDeployer)
    }) 

    }); 
