import { useState } from "react";
import JoinModal from "../components/JoinModal";

export function HomePage() {

    const [isPopupOpen, setIsModalOpen] = useState(false);
    const [role, setRole] = useState<string>("guest");
    const [modalType, setModalType] = useState<string>("guest");

    return (
        <div className="h-screen flex pt-[20vh] ">
            <div className="h-[70vh] w-1/2  flex flex-col gap-6 py-[10vh] ">
                <div className="text-5xl font-bold text-white">
                    Watch movies with you friends from anywhere
                </div>
                <div className="text-xl font-base text-white">
                    Just share the roomId, connect with you friends and watch movies while chatting with each other
                </div>
                <div className="w-full flex gap-6 text-white ">
                    <button
                        onClick={() => {
                            setRole("host");
                            setModalType("host");
                            setIsModalOpen(true);

                        }}
                        className="bg-neutral-900 w-[30vh] h-[8vh] uppercase"
                    >
                        host
                    </button>
                    <button
                        onClick={() => {
                            setRole("guest");
                            setModalType("guest");
                            setIsModalOpen(true);

                        }}
                        className="bg-neutral-900 w-[30vh] h-[8vh] uppercase"
                    >
                        join
                    </button>
                </div>
            </div>
            <div className="h-[50vh] w-1/2">
                <img
                    className="w-full h-full object-fit"
                    src="./hero_img.svg"
                />
            </div>
            <JoinModal
                role={role}
                modalType={modalType}
                isOpen={isPopupOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    )
}
