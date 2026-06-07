export default function SectionBg({ src }) {
  return (
    <div className="section-bg" aria-hidden="true">
      <img className="bg-spot bg-spot-1" src={src} alt="" />
      <img className="bg-spot bg-spot-2" src={src} alt="" />
      <img className="bg-spot bg-spot-3" src={src} alt="" />
      <img className="bg-spot bg-spot-4" src={src} alt="" />
    </div>
  )
}
