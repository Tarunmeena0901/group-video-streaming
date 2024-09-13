import { useNavigate } from "react-router-dom"

export function HomePage() {

    const navigate = useNavigate();
    return (
        <div className="h-screen flex justify-center items-center">
        <div className="flex gap-4 text-white">
            <button
            onClick={()=> navigate("/host")} 
            className="bg-neutral-900 w-[20vh] h-[8vh] uppercase"
            >
                host
            </button>
            <button 
            onClick={()=> navigate("/guest")} 
            className="bg-neutral-900 w-[20vh] h-[8vh] uppercase"
            >
                join
            </button>
        </div>
        </div>
    )
}