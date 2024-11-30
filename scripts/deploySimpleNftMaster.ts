import { Address, beginCell, toNano } from '@ton/core';
import { SimpleNftMaster } from '../wrappers/SimpleNftMaster';
import { NetworkProvider } from '@ton/blueprint';
import { SimpleNftCollection } from '../wrappers/SimpleNftCollection';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const owner = await ui.input('Owner address:');
    const simpleNftMaster = provider.open(await SimpleNftMaster.fromInit(
         Address.parse(owner),
         toNano("0.25")
    ));
    const myRoyaltyParams = {
        $$type: "RoyaltyParams" as "RoyaltyParams",
        numerator: 100n, // 350n = 35%
        denominator: 1000n,
        destination: owner,
    }
    await simpleNftMaster.send(
        provider.sender(),
        {
            value: toNano('0.5'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(simpleNftMaster.address);

    const collectionAddress = await simpleNftMaster.getGetCollectionAddressByIndex(0n);

    console.log('Data', await simpleNftMaster.getGetMasterData());
    console.log("First collection will be:", collectionAddress);
    console.log('Address of the first collection: ', await simpleNftMaster.getGetCollectionAddressByIndex(0n));

}
