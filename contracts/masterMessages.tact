message transferOwner {
    new_owner: Address;
}

message withdraw {
    address: Address;
}



message mintCollection {
    to: Address;
    tonPrice: Int;
    mintLimit: Int;
    mintPerUserLimit: Int;
    saleable: Boolean;
    image: String;
}