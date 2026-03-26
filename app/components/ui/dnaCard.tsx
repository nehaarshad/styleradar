import { StyleDNAModel } from "@/model/userStyleDNA"
import { Chip } from "./chips"

export default function CurrentDNACard({
  dna,
}: {
  dna: StyleDNAModel
}) {
  // Handle both camelCase and snake_case field names
  const silhouettePrefs =  dna.silhouettePrefs || []
  const colorPalette = dna.colorPalette || []
  const fabricTypes =  dna.fabricTypes || []
  const aestheticKeywords = dna.aestheticKeywords || []
  const occasionStyle =  dna.occasionStyle || ''

  return (
    <div className="rounded-2xl overflow-hidden border border-[#E8E3DD] bg-white shadow-sm">
      {/* Card header */}
      <div
        className="px-6 py-5 bg-[#E8E3DD] border-b border-[#E8E3DD]"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full text-[#1f1d1d] animate-pulse" />
          <p className="text-[#1f1d1d] text-xs font-bold uppercase tracking-widest">
            Current Style DNA
          </p>
        </div>
        <p className="text-[#A0A0A0] text-sm leading-relaxed mt-2">{dna.description}</p>
      </div>

      {/* Attributes grid */}
      <div className="p-6 grid sm:grid-cols-2 gap-5">
        {silhouettePrefs.length > 0 && (
          <div>
            <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2 font-medium">
              Silhouettes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {silhouettePrefs.map((v: string) => <Chip key={v} label={v} type="silhouette" />)}
            </div>
          </div>
        )}
        
        {colorPalette.length > 0 && (
          <div>
            <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2 font-medium">
              Colours
            </p>
            <div className="flex flex-wrap gap-1.5">
              {colorPalette.map((v: string) => <Chip key={v} label={v} type="color" />)}
            </div>
          </div>
        )}
        
        {fabricTypes.length > 0 && (
          <div>
            <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2 font-medium">
              Fabrics
            </p>
            <div className="flex flex-wrap gap-1.5">
              {fabricTypes.map((v: string) => <Chip key={v} label={v} type="fabric" />)}
            </div>
          </div>
        )}
        
        {aestheticKeywords.length > 0 && (
          <div>
            <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2 font-medium">
              Aesthetics
            </p>
            <div className="flex flex-wrap gap-1.5">
              {aestheticKeywords.map((v: string) => <Chip key={v} label={v} type="aesthetic" />)}
            </div>
          </div>
        )}
        
        {occasionStyle && (
          <div>
            <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2 font-medium">
              Occasion
            </p>
            <Chip label={occasionStyle} type="occasion" />
          </div>
        )}
      </div>
    </div>
  )
}