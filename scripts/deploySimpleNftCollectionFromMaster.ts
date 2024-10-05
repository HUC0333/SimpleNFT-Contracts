import { Address, beginCell, toNano } from '@ton/core';
import { SimpleNftCollection } from '../wrappers/SimpleNftCollection';
import { NetworkProvider } from '@ton/blueprint';
import { SimpleNftMaster } from '../wrappers/SimpleNftMaster';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const master = Address.parse(args.length > 0 ? args[0] : await ui.input('SimpleNftMaster address'));
    const string_first = "https://s.getgems.io/nft/c/66eb584daac141e834f514c1/meta.json";
    const string_content = "https://s.getgems.io/nft/c/66eb584daac141e834f514c1/1/meta.json";
    const content = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeBuffer(Buffer.from(string_first)).endCell();
    const nftContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeBuffer(Buffer.from(string_content)).endCell();
    const owner = Address.parse("EQBXOYPdhtLTaY3UJ8Cb69k7-nDFMPrR3S9lhWuk3uscesyQ");
 //  Address.parse("UQASOROUZS1xSjdKIZXzoR59-LRqs48Kc6ZXjTYNKAdQzrMu");
    const myRoyaltyParams = {
        $$type: "RoyaltyParams" as "RoyaltyParams",
        numerator: 100n, // 350n = 35%
        denominator: 1000n,
        destination: owner,
    }
    const simpleNftMaster = provider.open(SimpleNftMaster.fromAddress(master));
    const collectionIndex = await simpleNftMaster.getGetNextCollectionIndex();
    const collectionAddress = await simpleNftMaster.getGetCollectionAddressByIndex(collectionIndex);

    console.log("Next index: ", collectionIndex);

    await simpleNftMaster.send(
        provider.sender(),
        {
            value: toNano('0.5'),
        },
        {
            $$type:"CollectionMintParams",
            queryId: 0n,
            owner_address: owner, 
            collection_content: content, 
            royalty_params: myRoyaltyParams,
            nft_individual_content_url: nftContent,
            mint_limit: 0n,
            nft_price: toNano("0.5")
        }
    );


    console.log("Deployed: ", collectionAddress);
    if (collectionAddress) {
        setTimeout(async() => {
            const collection = provider.open(SimpleNftCollection.fromAddress(collectionAddress))
            console.log('Data', await collection.getGetCollectionData());
        }, 30000)
    }

}