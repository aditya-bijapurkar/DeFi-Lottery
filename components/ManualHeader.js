import { useMoralis } from "react-moralis";

export default function ManualHeader() {
    const { enableWeb3 } = useMoralis();

    return <div>Moralis is on baby</div>;
}