"use client"
import { motion } from "framer-motion"
import { ReactNode, useRef, useState } from "react"

export function NavBar() {
    const [position, setPostion] = useState({
        opacity: 0,
        left:0,
        width: 0,
    })

    return (
        <div className="z-20 absolute sticky top-5 h-[4vh] flex items-center justify-center bg-transparent w-full">
            <div className="relative text-white flex justify-between sm:justify-center items-center rounded-lg w-[65vh] sm:w-[110vh] h-[6vh] backdrop-blur bg-neutral-900/30 border-2 border-neutral-800 ">
                <div className=" text-xl font-extrabold gap-1 cursor-pointer rounded flex justify-center items-center"> 
                    StreamMp4
                </div>
                <div className="sm:flex justify-center items-center hidden">
                <Tabs setPosition={setPostion}>Products</Tabs>
                <Tabs setPosition={setPostion}>Company</Tabs>
                <Tabs setPosition={setPostion}>Blogs</Tabs>
                <Tabs setPosition={setPostion}>Pricing</Tabs>
                </div>
                <div className="flex justify-center items-center">
                <button className="mx-2 text-sm bg-slate-900 rounded-lg h-[4vh] w-[10vh] flex justify-center items-center">Login</button>
                <button className="mx-2 text-sm bg-white text-black rounded-lg h-[4vh] w-[10vh] flex justify-center items-center">SignUp</button>
                </div>
                <Cursor position={position}/>   
            </div>
        </div>
    )
}

const Tabs = ({ children , setPosition }: { children: ReactNode, setPosition: any }) => {
    const ref = useRef<any>(null);
    return (
            <li
            ref={ref}
            onMouseLeave={() => {
                setPosition((pv: any) => ({
                    ...pv,
                    opacity: 0,
                }))
            }}
            onMouseEnter={() => {
                if(!ref.current) return;
                const {width} = ref.current?.getBoundingClientRect();
                setPosition({
                    opacity: 1,
                    left: ref.current?.offsetLeft,
                    width,
                })
            }}
            className=" cursor-pointer z-10 block px-3 py-1 md:px-5 mx-3 rounded text-sm  mix-blend-difference"
            >
                {children}
            </li>
    )
}

const Cursor = ({position} : {
    position: any
} ) => {
    return <motion.div
    animate={position}
    className="absolute z-0 h-8 bg-black rounded-lg bg-white"
    />
}