import { Address, beginCell, toNano } from '@ton/core';
import { SimpleNftMaster } from '../wrappers/SimpleNftMaster';
import { NetworkProvider } from '@ton/blueprint';
import { SimpleNftCollection } from '../wrappers/SimpleNftCollection';

export async function run(provider: NetworkProvider) {
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const owner = Address.parse("EQBXOYPdhtLTaY3UJ8Cb69k7-nDFMPrR3S9lhWuk3uscesyQ");
    const string_first = "https://s.getgems.io/nft/c/66eb584daac141e834f514c1/meta.json";
    const string_content = "https://s.getgems.io/nft/c/66eb584daac141e834f514c1/1/meta.json";
    const content = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeBuffer(Buffer.from(string_first)).endCell();
    const nftContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeBuffer(Buffer.from(string_content)).endCell();
    const simpleNftMaster = provider.open(await SimpleNftMaster.fromInit(
         owner,
         toNano("0.5")
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
    console.log('Address of the first collection: ', await simpleNftMaster.getGetCollectionAddressByIndex(0n));
    /* 
    const firstCollectionCreate = await simpleNftMaster.send(
        provider.sender(),
        {
            value: toNano('0.5'),
        },
        {
            $$type: "CollectionMintParams",
            queryId: 0n, 
            owner_address: owner, 
            collection_content: content, 
            nft_individual_content_url: nftContent,
            royalty_params: myRoyaltyParams,
            mint_limit: 0n,
            nft_price: toNano("1.1")
        }
    );
    if (collectionAddress) {
        const createdCollection = provider.open(SimpleNftCollection.fromAddress(collectionAddress));
        console.log("Data: ", createdCollection.getGetCollectionData());
    } */
}
