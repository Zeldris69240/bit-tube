import Image from "next/image"

export default function Home() {
  return (
    <div>
      <Image src="/logo.png" height={100} width={100} alt="Logo"/>
      <p className="text-xl font-semibold tracking-tight">Bit-Tube</p>
    </div>
  )
}