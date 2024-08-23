import { toNano } from '@ton/core';
import { SimpleNFTMaster } from '../wrappers/SimpleNFTMaster';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const simpleNFTMaster = provider.open(await SimpleNFTMaster.fromInit());

    await simpleNFTMaster.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(simpleNFTMaster.address);

    // run methods on `simpleNFTMaster`
}
