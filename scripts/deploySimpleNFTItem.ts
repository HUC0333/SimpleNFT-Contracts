import { toNano } from '@ton/core';
import { SimpleNFTItem } from '../wrappers/SimpleNFTItem';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const simpleNFTItem = provider.open(await SimpleNFTItem.fromInit());

    await simpleNFTItem.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(simpleNFTItem.address);

    // run methods on `simpleNFTItem`
}
