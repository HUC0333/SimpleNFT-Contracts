import { Address, beginCell, toNano } from '@ton/core';
import { SimpleNftCollection } from '../wrappers/SimpleNftCollection';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "https://tg.hidrona.com/ton_img/collection.json";
    const string_item = "https://tg.hidrona.com/ton_img/item.json";
    const content = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();
    const nftContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_item).endCell();
    const owner = Address.parse("EQBXOYPdhtLTaY3UJ8Cb69k7-nDFMPrR3S9lhWuk3uscesyQ");
    const simpleNftCollection = provider.open(await SimpleNftCollection.fromInit(
        owner,
        content,
        nftContent,
        toNano("1.5"),
        {
            $$type: "RoyaltyParams",
            numerator: 350n, // 350n = 35%
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
