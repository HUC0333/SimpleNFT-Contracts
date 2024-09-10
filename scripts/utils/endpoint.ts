const tonClientEndpoint = "https://toncenter.com/api/v2/jsonRPC?api_key=";

export async function getEndpoint() {
    const url = `
    https://${process.env.NETWORK === "testnet" ? "testnet." : "" }toncenter.com/api/v2/jsonRPC?api_key=${process.env.API_KEY}
    `
    return url;
}