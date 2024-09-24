import { Address, beginCell, toNano } from '@ton/core';
import { NftCollection } from '../wrappers/UsualNftCollection';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const owner = Address.parse("EQBXOYPdhtLTaY3UJ8Cb69k7-nDFMPrR3S9lhWuk3uscesyQ");
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "https://s.getgems.io/nft/b/c/63efd8c45cbb99c2caf514d7/edit/meta-1680207432341.json";
    const collectionContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeBuffer(Buffer.from(string_first)).endCell();
    const usualNftCollection = provider.open(await NftCollection.fromInit(
        owner,
        collectionContent,
        {
            $$type: "RoyaltyParams",
            numerator: 100n, 
            denominator: 1000n,
            destination: owner,
        }
      )
    );

    await usualNftCollection.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(usualNftCollection.address);

}
