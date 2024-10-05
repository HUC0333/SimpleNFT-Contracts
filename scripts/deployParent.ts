import { toNano } from '@ton/core';
import { NewTodo, Parent } from '../wrappers/Parent';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const todoParent = provider.open(await Parent.fromInit());

    await todoParent.send(
        provider.sender(),
        {
            value: toNano('0.3'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(todoParent.address);

    

    // run methods on `todoParent`
}