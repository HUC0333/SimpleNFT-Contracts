import { toNano } from '@ton/core';
import { SimpleNFTCollection } from '../wrappers/SimpleNFTCollection';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const simpleNFTCollection = provider.open(await SimpleNFTCollection.fromInit());

    await simpleNFTCollection.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(simpleNFTCollection.address);

    // run methods on `simpleNFTCollection`
}
