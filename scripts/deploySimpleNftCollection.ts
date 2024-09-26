import { Address, beginCell, toNano } from '@ton/core';
import { SimpleNftCollection } from '../wrappers/SimpleNftCollection';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "https://s.getgems.io/nft/c/66eb584daac141e834f514c1/meta.json";
    const string_content = "https://s.getgems.io/nft/c/66eb584daac141e834f514c1/1/meta.json";
    const content = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeBuffer(Buffer.from(string_first)).endCell();
    const nftContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeBuffer(Buffer.from(string_content)).endCell();
    const owner = Address.parse("EQBXOYPdhtLTaY3UJ8Cb69k7-nDFMPrR3S9lhWuk3uscesyQ");
    const master = Address.parse("EQBXOYPdhtLTaY3UJ8Cb69k7-nDFMPrR3S9lhWuk3uscesyQ"); //  Address.parse("UQASOROUZS1xSjdKIZXzoR59-LRqs48Kc6ZXjTYNKAdQzrMu");
    const myRoyaltyParams = {
        $$type: "RoyaltyParams" as "RoyaltyParams",
        numerator: 100n, // 350n = 35%
        denominator: 1000n,
        destination: owner,
    }
    const simpleNftCollection = provider.open(await SimpleNftCollection.fromInit(
        master,
        0n
    ));

    const send = await simpleNftCollection.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        }, {
            $$type:"CollectionSetupParams",
            owner_address: owner, 
            master_address: master, 
            collection_content: content, 
            royalty_params: myRoyaltyParams,
            nft_individual_content_url: nftContent,
            mint_limit: 0n,
            nft_price: toNano("0.3")
        }
    )

    await simpleNftCollection.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(simpleNftCollection.address);

    console.log('Data', await simpleNftCollection.getGetCollectionData());
}