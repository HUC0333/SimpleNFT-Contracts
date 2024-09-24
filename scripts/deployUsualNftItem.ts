import { toNano } from '@ton/core';
import { UsualNftItem } from '../wrappers/UsualNftItem';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const usualNftItem = provider.open(await UsualNftItem.fromInit(BigInt(Math.floor(Math.random() * 10000))));

    await usualNftItem.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(usualNftItem.address);

    console.log('ID', await usualNftItem.getId());
}
