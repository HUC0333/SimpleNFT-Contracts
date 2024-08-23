import { toNano } from '@ton/core';
import { SimpleNFT } from '../wrappers/SimpleNFT';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const simpleNFT = provider.open(await SimpleNFT.fromInit(BigInt(Math.floor(Math.random() * 10000))));

    await simpleNFT.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(simpleNFT.address);

    console.log('ID', await simpleNFT.getId());
}
