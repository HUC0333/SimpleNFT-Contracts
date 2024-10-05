import { Address, toNano } from '@ton/core';
import { CompleteTodo, NewTodo, Parent } from '../wrappers/Parent';
import { NetworkProvider, sleep } from '@ton/blueprint';
import { TodoChild } from '../build/Parent/tact_TodoChild';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Parent address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const parent = provider.open(Parent.fromAddress(address));

    const message: NewTodo = {
        $$type: 'NewTodo',
        task: "todo1"
    }

    await parent.send(provider.sender(), {
        value: toNano("0.3")
    }, message);

    const todoChildAddr = await parent.getTodoAddress(1n);

    console.log("Find address: ", todoChildAddr);

    const todoChild = provider.open(TodoChild.fromAddress(todoChildAddr))

    
    const details = await todoChild.getDetails()
   
    console.log("details - ", details)
   
    const messageComplete : CompleteTodo = {
        $$type: 'CompleteTodo',
        seqno: 1n
    }

    await parent.send(provider.sender(), {
        value: toNano("1.5")
    }, messageComplete)

    console.log("details - ", await todoChild.getDetails())
    
    ui.clearActionPrompt();
    ui.write('Counter increased successfully!');
}
