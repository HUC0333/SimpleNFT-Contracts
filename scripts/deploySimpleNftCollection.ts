import { Address, beginCell, toNano } from '@ton/core';
import { SimpleNftCollection } from '../wrappers/SimpleNftCollection';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "https://s.getgems.io/nft/c/66eb584daac141e834f514c1/meta.json";
    const string_content = "1/meta.json";
    const content = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeBuffer(Buffer.from(string_first)).endCell();
    const owner = Address.parse("EQBXOYPdhtLTaY3UJ8Cb69k7-nDFMPrR3S9lhWuk3uscesyQ");
    const master = Address.parse("UQASOROUZS1xSjdKIZXzoR59-LRqs48Kc6ZXjTYNKAdQzrMu");
    const simpleNftCollection = provider.open(await SimpleNftCollection.fromInit(
        owner,
        master,
        content,
        string_content,
        toNano("1.1"),
        1000n,
        {
            $$type: "RoyaltyParams",
            numerator: 100n, // 350n = 35%
            denominator: 1000n,
            destination: owner,
        }
    ));

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