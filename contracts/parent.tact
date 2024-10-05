import "@stdlib/deploy";
import "./child";

message Add {
    queryId: Int as uint64;
    amount: Int as uint32;
}

contract Parent with Deployable {

    owner: Address;
    numTodos: Int as uint256 = 0;

    init() {
        self.owner = sender();
    }

    receive(msg: NewTodo) {
        self.numTodos = self.numTodos + 1;
        let init: StateInit = self.getChildItemInit(self.numTodos);
        let value: Int = context().value;

        send(SendParameters{
            to: contractAddress(init),
            body: InternalSetTask{task: msg.task}.toCell(),
            value: value,
            mode: SendIgnoreErrors,
            code: init.code,
            data: init.data
        });

        // self.reply(NewTodoResponse{seqno: self.numTodos}.toCell());
    }

    receive(msg: CompleteTodo){
        require(msg.seqno <= self.numTodos, "Todo does not exist");
        send(SendParameters{
            to: contractAddress(initOf TodoChild(myAddress(), msg.seqno)),
            body: InternalComplete{excess: sender()}.toCell(),
            value: 0,
            mode: SendRemainingValue + SendIgnoreErrors
        });
    }

    get fun getChildItemInit(item_index: Int): StateInit {
        return initOf TodoChild(myAddress(), item_index);
    }

    get fun numTodos(): Int {
        return self.numTodos;
    }

    get fun todoAddress(seqno: Int): Address{
        return contractAddress(initOf TodoChild(myAddress(), seqno));
    }
}
