import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, toNano } from '@ton/core';
import { SimpleNftMaster } from '../wrappers/SimpleNftMaster';
import '@ton/test-utils';
import { SimpleNftCollection } from '../wrappers/SimpleNftCollection';
import { NftItem } from '../wrappers/SimpleNftItem';

describe('SimpleNftMaster', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let simpleNftMaster: SandboxContract<SimpleNftMaster>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        const owner = Address.parse("EQBXOYPdhtLTaY3UJ8Cb69k7-nDFMPrR3S9lhWuk3uscesyQ");
        const OFFCHAIN_CONTENT_PREFIX = 0x01;
        const string_first = "https://s.getgems.io/nft/c/66eb584daac141e834f514c1/meta.json";
        const string_content = "https://s.getgems.io/nft/c/66eb584daac141e834f514c1/1/meta.json";
        const content = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeBuffer(Buffer.from(string_first)).endCell();
        const nftContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeBuffer(Buffer.from(string_content)).endCell();
        const myRoyaltyParams = {
            $$type: "RoyaltyParams" as "RoyaltyParams",
            numerator: 100n, // 350n = 35%
            denominator: 1000n,
            destination: owner,
        }

        simpleNftMaster = blockchain.openContract(await SimpleNftMaster.fromInit(
            owner,
            toNano("0.5")
        ));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await simpleNftMaster.send(
            deployer.getSender(),
            {
                value: toNano('1.0'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        const collectionAddress = await simpleNftMaster.getGetCollectionAddressByIndex(0n);

        const firstCollectionCreate = await simpleNftMaster.send(
            deployer.getSender(),
            {
                value: toNano('0.5'),
            },
            {
                $$type: "CollectionMintParams",
                queryId: 0n, 
                owner_address: deployer.getSender().address, 
                collection_content: content, 
                nft_individual_content_url: nftContent,
                royalty_params: myRoyaltyParams,
                mint_limit: 0n,
                nft_price: toNano("1.1")
            }
        );
        if (collectionAddress) {
            const collectionContract = blockchain.openContract(SimpleNftCollection.fromAddress(collectionAddress));

            console.log("Collection data: ", await collectionContract.getGetCollectionData());
            console.log("Master after data: ", await simpleNftMaster.getGetNextCollectionIndex());

            await collectionContract.send(
                deployer.getSender(),
                {
                    value: toNano('1.1'),
                 },
                 "Mint"
             );
            
            const nftAddress = await collectionContract.getGetNftAddressByIndex(0n);
            console.log("Nft address: ", nftAddress);
            console.log("Collection after data: ", await collectionContract.getGetCollectionData());
            if (nftAddress) {
                const nftContract = blockchain.openContract(NftItem.fromAddress(nftAddress));
                console.log("Nft data: ", await nftContract.getGetNftData());
            }
        }

        console.log("Found address: ", collectionAddress);
         
        // expect(true)
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: simpleNftMaster.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and simpleNftCollection are ready to use
    });

});
