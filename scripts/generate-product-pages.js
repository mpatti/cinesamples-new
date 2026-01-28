const fs = require('fs');
const path = require('path');

// Complete product descriptions - no scraping needed
const PRODUCTS = [
  // STRINGS
  { 
    name: 'CineStrings Core', slug: 'cinestrings-core', category: 'Strings', 
    image: 'cinestrings-core.png',
    tagline: 'Essential Orchestral Strings',
    description: 'CineStrings CORE is a comprehensive orchestral string library recorded at the legendary Sony Scoring Stage. Featuring lush ensemble sections with multiple articulations, this library delivers the classic Hollywood string sound used in countless film scores.',
    features: ['Recorded at Sony Scoring Stage', 'Full string sections: Violins, Violas, Cellos, Basses', 'Multiple articulations including legato', 'Mixed by Dennis Sands']
  },
  { 
    name: 'CineStrings Pro', slug: 'cinestrings-pro', category: 'Strings', 
    image: 'cinestrings-pro.png',
    tagline: 'Advanced Orchestral Strings',
    description: 'CineStrings PRO expands on the CORE library with additional articulations, extended techniques, and divisi sections. Perfect for composers needing maximum flexibility and expression in their string arrangements.',
    features: ['Extended articulations', 'Divisi sections', 'Advanced performance techniques', 'Seamless integration with CineStrings CORE']
  },
  { 
    name: 'CineStrings Solo', slug: 'cinestrings-solo', category: 'Strings', 
    image: 'cinestrings-solosolo-strings.png',
    tagline: 'Expressive Solo Strings',
    description: 'CineStrings SOLO captures intimate solo performances from world-class string players. Each instrument was recorded with meticulous attention to detail, delivering expressive and realistic solo string sounds.',
    features: ['Solo Violin, Viola, Cello, and Bass', 'Deeply sampled articulations', 'Expressive legato transitions', 'Perfect for intimate passages']
  },
  { 
    name: 'CineStrings Runs', slug: 'cinestrings-runs', category: 'Strings', 
    image: 'cinestrings-runs.png',
    tagline: 'Orchestral String Runs',
    description: 'CineStrings RUNS delivers authentic orchestral string runs and flourishes. Pre-recorded phrases performed by professional orchestral musicians provide instant access to complex string passages.',
    features: ['Authentic orchestral runs', 'Multiple speeds and directions', 'Easy to use phrase-based system', 'Perfect for action and drama']
  },
  { 
    name: 'Viola Da Gamba', slug: 'viola-da-gamba', category: 'Strings', 
    image: 'viola-da-gamba.png',
    tagline: 'Renaissance String Instrument',
    description: 'The Viola da Gamba is a beautifully sampled recreation of this historic instrument. Its warm, intimate tone is perfect for period pieces, fantasy scores, and any production requiring an authentic early music sound.',
    features: ['Authentic Viola da Gamba sound', 'Multiple articulations', 'Warm, intimate tone', 'Perfect for period and fantasy scores']
  },
  { 
    name: 'Quatre', slug: 'quatre', category: 'Strings', 
    image: 'quatre.png',
    tagline: 'String Quartet',
    description: 'Quatre captures the intimate sound of a professional string quartet. Recorded in a beautiful acoustic space, this library delivers the perfect chamber music sound for intimate scoring needs.',
    features: ['Professional string quartet', 'Intimate chamber sound', 'Multiple articulations', 'Beautiful room ambience']
  },
  { 
    name: 'Hardanger Fiddle', slug: 'hardanger-fiddle', category: 'Strings', 
    image: 'hardanger-fiddlenorwegian-resonant-fiddle.png',
    tagline: 'Norwegian Folk Instrument',
    description: 'The Hardanger Fiddle is a traditional Norwegian instrument known for its haunting resonance from sympathetic strings. This deeply sampled library captures its unique character for folk, fantasy, and cinematic applications.',
    features: ['Authentic Hardanger Fiddle', 'Sympathetic string resonance', 'Norwegian folk character', 'Cinematic and fantasy applications']
  },
  
  // BRASS
  { 
    name: 'CineBrass Core', slug: 'cinebrass-core', category: 'Brass', 
    image: 'cinebrass-coreorchestral-brass.png',
    tagline: 'Essential Orchestral Brass',
    description: 'CineBrass CORE is the industry-standard orchestral brass library, recorded at the MGM Scoring Stage. Featuring Trumpets, Horns, Trombones, and Tuba with multiple articulations, it delivers the powerful Hollywood brass sound.',
    features: ['Recorded at MGM Scoring Stage', 'Full brass sections', 'Multiple articulations', 'Industry standard brass sound']
  },
  { 
    name: 'CineBrass Pro', slug: 'cinebrass-pro', category: 'Brass', 
    image: 'cinebrass-proorchestral-brass.png',
    tagline: 'Advanced Orchestral Brass',
    description: 'CineBrass PRO expands the CORE library with additional articulations, solo instruments, and extended techniques. The go-to choice for composers needing the ultimate in orchestral brass flexibility.',
    features: ['Extended articulations', 'Solo brass instruments', 'Advanced techniques', 'Seamless CORE integration']
  },
  { 
    name: 'CineBrass Deep Horns', slug: 'cinebrass-deep-horns', category: 'Brass', 
    image: 'cinebrass-deep-hornsdeep-orchestral-brass.png',
    tagline: 'Low Horn Ensemble',
    description: 'CineBrass Deep Horns delivers the massive sound of a large low horn ensemble. Perfect for epic, dark, and powerful scoring needs, this library adds serious weight to any brass section.',
    features: ['Massive low horn sound', 'Epic and powerful tones', 'Multiple articulations', 'Perfect for dark, dramatic scores']
  },
  { 
    name: 'CineBrass Descant Horn', slug: 'cinebrass-descant-horn', category: 'Brass', 
    image: 'cinebrass-descant-hornorchestral-horns.png',
    tagline: 'High Horn Clarity',
    description: 'The CineBrass Descant Horn captures the brilliant, clear tone of the high descant horn. Its bright character cuts through any mix, perfect for fanfares and soaring melodic lines.',
    features: ['Brilliant high horn tone', 'Clear and cutting sound', 'Perfect for fanfares', 'Soaring melodic capability']
  },
  { 
    name: 'CineBrass Low Brass', slug: 'cinebrass-low-brass', category: 'Brass', 
    image: 'cinebrass-low-brasslow-pitched-orchestral-brass.png',
    tagline: 'Powerful Low Brass',
    description: 'CineBrass Low Brass delivers earth-shaking low brass power. Bass Trombones, Contrabass Trombone, and Cimbasso provide the foundation for epic and dramatic scoring.',
    features: ['Earth-shaking low end', 'Bass and Contrabass Trombones', 'Cimbasso', 'Foundation for epic scores']
  },
  { 
    name: 'CineBrass Sonore', slug: 'cinebrass-sonore', category: 'Brass', 
    image: 'cinebrass-sonoretrumpet-and-horn-ensembles.png',
    tagline: 'Trumpet and Horn Ensembles',
    description: 'CineBrass Sonore features beautiful trumpet and horn ensemble combinations. The warm, blended sound is perfect for romantic, noble, and heroic musical passages.',
    features: ['Trumpet and horn ensembles', 'Warm, blended sound', 'Romantic and noble tones', 'Perfect for heroic passages']
  },
  { 
    name: 'Industry Brass Core', slug: 'industry-brass-core', category: 'Brass', 
    image: 'industry-brass-coreorchestral-brass.png',
    tagline: 'Newman Stage Brass',
    description: 'Industry Brass was recorded at the legendary Alfred Newman Scoring Stage at Fox Studios. This library captures the lush, warm brass sound that has defined countless Hollywood film scores.',
    features: ['Alfred Newman Scoring Stage', 'Lush, warm brass tone', 'Hollywood film score sound', 'Premium brass sections']
  },
  { 
    name: 'Industry Brass Pro', slug: 'industry-brass-pro', category: 'Brass', 
    image: 'industry-brass-proorchestral-brass.png',
    tagline: 'Extended Newman Stage Brass',
    description: 'Industry Brass PRO expands on the CORE library with additional articulations and extended techniques. More power and flexibility from the legendary Newman Stage.',
    features: ['Extended articulations', 'Additional techniques', 'Newman Stage sound', 'Maximum brass flexibility']
  },
  
  // WOODWINDS
  { 
    name: 'CineWinds Core', slug: 'cinewinds-core', category: 'Woodwinds', 
    image: 'cinewinds-coreorchestral-woodwind-essentials.png',
    tagline: 'Essential Orchestral Woodwinds',
    description: 'CineWinds CORE delivers essential orchestral woodwind sounds recorded by top Hollywood session players. Flutes, Oboes, Clarinets, and Bassoons with multiple articulations for authentic orchestral scoring.',
    features: ['Full woodwind sections', 'Top Hollywood session players', 'Multiple articulations', 'Authentic orchestral sound']
  },
  { 
    name: 'CineWinds Pro', slug: 'cinewinds-pro', category: 'Woodwinds', 
    image: 'cinewinds-proorchestral-woodwinds.png',
    tagline: 'Advanced Orchestral Woodwinds',
    description: 'CineWinds PRO expands the woodwind palette with extended articulations, solo instruments, and auxiliary woodwinds including Piccolo, English Horn, Bass Clarinet, and Contrabassoon.',
    features: ['Extended articulations', 'Auxiliary woodwinds', 'Solo instruments', 'Complete woodwind coverage']
  },
  { 
    name: 'CineWinds Low Winds', slug: 'cinewinds-low-winds', category: 'Woodwinds', 
    image: 'cinewinds-low-windslow-pitched-woodwinds.png',
    tagline: 'Low Register Woodwinds',
    description: 'CineWinds Low Winds focuses on the dark, rich sounds of low-pitched woodwinds. Bass Clarinet, Contrabassoon, and other low instruments provide unique colors for scoring.',
    features: ['Low-pitched woodwinds', 'Dark, rich tones', 'Unique orchestral colors', 'Perfect for atmospheric scoring']
  },
  { 
    name: 'Hollywoodwinds', slug: 'hollywoodwinds', category: 'Woodwinds', 
    image: 'hollywoodwinds.png',
    tagline: 'Classic Hollywood Woodwinds',
    description: 'Hollywoodwinds captures the classic sound of Golden Age Hollywood woodwind sections. Warm, expressive, and instantly recognizable, this library delivers timeless orchestral beauty.',
    features: ['Classic Hollywood sound', 'Warm, expressive tone', 'Golden Age character', 'Timeless orchestral beauty']
  },
  
  // PERCUSSION
  { 
    name: 'CinePerc Orchestral', slug: 'cineperc-orchestral', category: 'Percussion', 
    image: 'cineperc-orchestralorchestral-percussion.png',
    tagline: 'Complete Orchestral Percussion',
    description: 'CinePerc Orchestral delivers the complete range of orchestral percussion instruments. Timpani, snares, bass drums, cymbals, and more - all recorded with pristine quality.',
    features: ['Complete orchestral percussion', 'Timpani and tuned percussion', 'Snares, bass drums, cymbals', 'Pristine recording quality']
  },
  { 
    name: 'CinePerc Epic', slug: 'cineperc-epic', category: 'Percussion', 
    image: 'cineperc-epicepic-percussion.png',
    tagline: 'Massive Cinematic Percussion',
    description: 'CinePerc Epic brings massive, earth-shaking percussion designed for trailer music and epic scoring. Huge hits, powerful ensembles, and cinematic impacts.',
    features: ['Massive, epic sound', 'Trailer-ready percussion', 'Huge hits and impacts', 'Cinematic power']
  },
  { 
    name: 'CinePerc Aux', slug: 'cineperc-aux', category: 'Percussion', 
    image: 'cineperc-auxauxiliary-percussion.png',
    tagline: 'Auxiliary Percussion',
    description: 'CinePerc Aux covers the essential auxiliary percussion instruments. Shakers, tambourines, triangles, and countless small instruments for adding texture and rhythm.',
    features: ['Essential auxiliary percussion', 'Shakers, tambourines, triangles', 'Textural instruments', 'Rhythmic colors']
  },
  { 
    name: 'CinePerc Drum Kit', slug: 'cineperc-drum-kit', category: 'Percussion', 
    image: 'cineperc-drum-kita-punchy-score-ready-drum-kit.png',
    tagline: 'Score-Ready Drum Kit',
    description: 'CinePerc Drum Kit provides a punchy, score-ready acoustic drum kit. Perfect for adding drive and energy to film and TV scores.',
    features: ['Punchy acoustic drums', 'Score-ready sound', 'Full kit coverage', 'Cinematic drum tones']
  },
  { 
    name: 'CinePerc Metal', slug: 'cineperc-metal', category: 'Percussion', 
    image: 'cineperc-metalmetal-percussion.png',
    tagline: 'Metal Percussion',
    description: 'CinePerc Metal features a collection of metallic percussion instruments. Gongs, bells, metal hits, and industrial sounds for dramatic and experimental scoring.',
    features: ['Metal percussion instruments', 'Gongs and bells', 'Industrial sounds', 'Dramatic scoring colors']
  },
  { 
    name: 'CinePerc Tonal', slug: 'cineperc-tonal', category: 'Percussion', 
    image: 'cineperc-tonaltonal-percussion.png',
    tagline: 'Tuned Percussion',
    description: 'CinePerc Tonal covers tuned percussion instruments. Marimba, vibraphone, xylophone, glockenspiel, and more for melodic percussion needs.',
    features: ['Tuned percussion', 'Marimba, vibraphone, xylophone', 'Melodic capability', 'Beautiful tones']
  },
  { 
    name: 'CinePerc Wood', slug: 'cineperc-wood', category: 'Percussion', 
    image: 'cineperc-woodwood-percussion.png',
    tagline: 'Wood Percussion',
    description: 'CinePerc Wood delivers the organic sound of wooden percussion instruments. Woodblocks, temple blocks, log drums, and various ethnic wood instruments.',
    features: ['Wooden percussion', 'Organic textures', 'Ethnic instruments', 'Natural tones']
  },
  { 
    name: 'CinePerc World', slug: 'cineperc-world', category: 'Percussion', 
    image: 'cineperc-worldworld-percussion.png',
    tagline: 'World Percussion',
    description: 'CinePerc World explores percussion from around the globe. Djembes, frame drums, taikos, and instruments from diverse musical traditions.',
    features: ['Global percussion instruments', 'Djembes, frame drums, taikos', 'Diverse traditions', 'Authentic world sounds']
  },
  { 
    name: 'Drums of War 1', slug: 'drums-of-war-1', category: 'Percussion', 
    image: 'drums-of-war-1heavy-cinematic-percussion.png',
    tagline: 'Heavy Cinematic Percussion',
    description: 'Drums of War delivers massive, battle-ready percussion. Epic taikos, war drums, and thunderous ensembles designed for action and adventure scoring.',
    features: ['Massive war drums', 'Epic taikos', 'Battle-ready percussion', 'Action scoring essential']
  },
  { 
    name: 'Drums of War 2', slug: 'drums-of-war-2', category: 'Percussion', 
    image: 'drums-of-war-2epic-cinematic-percussion.png',
    tagline: 'Epic Cinematic Percussion',
    description: 'Drums of War 2 continues the epic percussion series with new instruments and ensembles. More massive drums, unique textures, and cinematic power.',
    features: ['Expanded drum arsenal', 'New epic ensembles', 'Unique textures', 'Maximum cinematic impact']
  },
  { 
    name: 'Drums of War 3', slug: 'drums-of-war-3', category: 'Percussion', 
    image: 'drums-of-war-3modern-cinematic-percussion.png',
    tagline: 'Modern Cinematic Percussion',
    description: 'Drums of War 3 brings a modern approach to epic percussion. Hybrid sounds, processed drums, and contemporary cinematic textures.',
    features: ['Modern percussion', 'Hybrid sounds', 'Processed textures', 'Contemporary scoring']
  },
  { 
    name: 'Collision Impact Designer', slug: 'collision-impact-designer', category: 'Percussion', 
    image: 'collision-impact-designer.png',
    tagline: 'Cinematic Impact Design',
    description: 'Collision Impact Designer provides powerful tools for creating custom impacts, hits, and sound design elements. Perfect for trailers, transitions, and dramatic moments.',
    features: ['Custom impact creation', 'Sound design tools', 'Trailer-ready sounds', 'Dramatic transitions']
  },
  
  // KEYBOARDS
  { 
    name: 'CinePiano', slug: 'cinepiano', category: 'Keyboards', 
    image: 'cinepianocinematic-piano.png',
    tagline: 'Cinematic Grand Piano',
    description: 'CinePiano captures a beautiful concert grand piano recorded specifically for cinematic applications. Warm, intimate, and expressive - perfect for emotional scoring.',
    features: ['Concert grand piano', 'Cinematic recording', 'Warm, intimate sound', 'Expressive dynamics']
  },
  { 
    name: 'CineHarps', slug: 'cineharps', category: 'Keyboards', 
    image: 'cineharpsorchestral-harp.png',
    tagline: 'Orchestral Harp',
    description: 'CineHarps delivers the definitive orchestral harp sound. Beautiful glissandi, expressive plucks, and all the articulations needed for authentic harp writing.',
    features: ['Definitive orchestral harp', 'Beautiful glissandi', 'Expressive articulations', 'Authentic harp sound']
  },
  { 
    name: 'CineHarpsichord', slug: 'cineharpsichord', category: 'Keyboards', 
    image: 'cineharpsichordorchestral-harpsichord.png',
    tagline: 'Orchestral Harpsichord',
    description: 'CineHarpsichord captures the brilliant, distinctive sound of the harpsichord. Perfect for period pieces, baroque-inspired scores, and unique keyboard colors.',
    features: ['Authentic harpsichord', 'Period-appropriate sound', 'Baroque character', 'Unique keyboard color']
  },
  { 
    name: 'Forbes Pipe Organ', slug: 'forbes-pipe-organ', category: 'Keyboards', 
    image: 'forbes-pipe-organan-expansive-pipe-organ.png',
    tagline: 'Expansive Pipe Organ',
    description: 'The Forbes Pipe Organ captures a magnificent concert pipe organ in stunning detail. From whisper-soft flutes to thundering full organ, this library delivers majestic sound.',
    features: ['Concert pipe organ', 'Full range of stops', 'Majestic sound', 'Stunning detail']
  },
  { 
    name: 'Session Piano Grand', slug: 'session-piano-grand', category: 'Keyboards', 
    image: 'session-piano-grandessential-grand-piano.png',
    tagline: 'Essential Grand Piano',
    description: 'Session Piano Grand delivers a versatile, studio-ready grand piano sound. Clean, warm, and perfect for all styles of music production.',
    features: ['Studio-ready sound', 'Versatile character', 'Clean and warm', 'All-purpose piano']
  },
  { 
    name: 'Keyboard In Blue', slug: 'keyboard-in-blue', category: 'Keyboards', 
    image: 'keyboard-in-bluevintage-amped-electric-piano.png',
    tagline: 'Vintage Electric Piano',
    description: 'Keyboard In Blue captures a beautiful vintage electric piano with that classic warm, amped sound. Perfect for jazz, soul, R&B, and cinematic applications.',
    features: ['Vintage electric piano', 'Warm amped sound', 'Jazz and soul character', 'Cinematic warmth']
  },
  { 
    name: 'Rhodes 73 EP', slug: 'rhodes-73-ep', category: 'Keyboards', 
    image: 'rhodes-73-epclassic-electric-piano.png',
    tagline: 'Classic Electric Piano',
    description: 'The Rhodes 73 EP delivers the iconic sound of the classic Fender Rhodes. Bell-like tones, warm bark, and silky smooth pads for timeless electric piano sounds.',
    features: ['Classic Rhodes sound', 'Bell-like tones', 'Warm character', 'Timeless electric piano']
  },
  { 
    name: 'Wurly', slug: 'wurly', category: 'Keyboards', 
    image: 'wurlywurlitzer-electric-piano.png',
    tagline: 'Wurlitzer Electric Piano',
    description: 'Wurly captures the distinctive sound of the Wurlitzer electric piano. Its bright, reedy character has defined countless classic recordings.',
    features: ['Wurlitzer sound', 'Bright, reedy tone', 'Classic character', 'Distinctive voice']
  },
  { 
    name: 'Randy Kerber - Celeste', slug: 'randy-kerber-celeste', category: 'Keyboards', 
    image: 'randy-kerber-celeste.png',
    tagline: 'Hollywood Celeste',
    description: 'The Randy Kerber Celeste captures the magical sound of this beloved instrument, recorded by renowned Hollywood session musician Randy Kerber. Instantly recognizable and beautifully recorded.',
    features: ['Magical celeste sound', 'Randy Kerber performance', 'Hollywood quality', 'Beautiful recording']
  },
  { 
    name: 'Randy Kerber - Prepared Piano', slug: 'randy-kerber-prepared-piano', category: 'Keyboards', 
    image: 'randy-kerber-prepared-piano.png',
    tagline: 'Creative Prepared Piano',
    description: 'Randy Kerber Prepared Piano explores the creative possibilities of a prepared piano. Unique textures, unusual timbres, and experimental sounds for creative scoring.',
    features: ['Prepared piano sounds', 'Unique textures', 'Experimental timbres', 'Creative scoring tool']
  },
  { 
    name: 'Colors', slug: 'colors', category: 'Keyboards', 
    image: 'colors.png',
    tagline: 'Textural Keyboard',
    description: 'Colors provides a palette of unique keyboard textures and sounds. Perfect for adding color, atmosphere, and interest to any production.',
    features: ['Unique textures', 'Atmospheric sounds', 'Creative colors', 'Production enhancement']
  },
  
  // CHOIR
  { 
    name: 'Voces8', slug: 'voces8', category: 'Choir', 
    image: 'voces8.png',
    tagline: 'World-Class A Cappella',
    description: 'Voces8 captures the world-renowned British vocal ensemble in stunning detail. Pure, precise, and beautifully blended voices for choral and contemporary applications.',
    features: ['Voces8 ensemble', 'Pure vocal sound', 'Precise blend', 'World-class recording']
  },
  { 
    name: 'Voxos', slug: 'voxos', category: 'Choir', 
    image: 'voxosvoxos.png',
    tagline: 'Epic Choir',
    description: 'Voxos delivers powerful, epic choir sounds for dramatic scoring. Full mixed choir with multiple syllables and articulations for maximum impact.',
    features: ['Epic choir sound', 'Full mixed voices', 'Multiple syllables', 'Dramatic impact']
  },
  { 
    name: 'Men Of The North', slug: 'men-of-the-north', category: 'Choir', 
    image: 'men-of-the-north.png',
    tagline: 'Nordic Male Choir',
    description: 'Men of the North features a powerful male choir with a distinctly Nordic character. Deep, resonant voices perfect for epic, fantasy, and historical scoring.',
    features: ['Nordic male choir', 'Deep resonant voices', 'Epic character', 'Fantasy and historical']
  },
  { 
    name: 'Women Of The North', slug: 'women-of-the-north', category: 'Choir', 
    image: 'women-of-the-north.png',
    tagline: 'Nordic Female Choir',
    description: 'Women of the North delivers ethereal female vocals with Nordic character. Haunting, beautiful, and perfect for emotional and atmospheric scoring.',
    features: ['Nordic female choir', 'Ethereal sound', 'Haunting beauty', 'Atmospheric scoring']
  },
  { 
    name: 'South African Choir', slug: 'south-african-choir', category: 'Choir', 
    image: 'south-african-choir.png',
    tagline: 'African Vocal Ensemble',
    description: 'South African Choir captures the vibrant, powerful sound of South African choral singing. Rich harmonies and rhythmic energy from this unique vocal tradition.',
    features: ['South African sound', 'Rich harmonies', 'Rhythmic energy', 'Unique vocal tradition']
  },
  { 
    name: 'South African Male Choir', slug: 'south-african-male-choir', category: 'Choir', 
    image: 'south-african-male-choir.png',
    tagline: 'African Male Voices',
    description: 'South African Male Choir focuses on the powerful male voices of the South African choral tradition. Deep, resonant, and full of rhythmic life.',
    features: ['Male South African voices', 'Deep and powerful', 'Rhythmic character', 'Authentic tradition']
  },
  { 
    name: 'South African Female Choir', slug: 'south-african-female-choir', category: 'Choir', 
    image: 'south-african-female-choir.png',
    tagline: 'African Female Voices',
    description: 'South African Female Choir showcases the beautiful female voices of South African singing. Bright, energetic, and deeply expressive.',
    features: ['Female South African voices', 'Bright and energetic', 'Deeply expressive', 'Authentic character']
  },
  
  // ARTIST SERIES
  { 
    name: 'Tina Guo - Acoustic Cello', slug: 'tina-guo-acoustic-cello', category: 'Artist Series', 
    image: 'tina-guo-acoustic-cello.png',
    tagline: 'Expressive Solo Cello',
    description: 'Tina Guo Acoustic Cello captures the extraordinary artistry of internationally acclaimed cellist Tina Guo. Deeply expressive legato and a full range of articulations.',
    features: ['Tina Guo performance', 'Expressive legato', 'Full articulations', 'World-class artistry']
  },
  { 
    name: 'Tina Guo - Electric Cello', slug: 'tina-guo-electric-cello', category: 'Artist Series', 
    image: 'tina-guo-electric-cello.png',
    tagline: 'Rock and Cinematic Cello',
    description: 'Tina Guo Electric Cello delivers aggressive, distorted, and processed cello sounds. Perfect for rock, metal, and high-energy cinematic scoring.',
    features: ['Electric cello sound', 'Aggressive processing', 'Rock and metal ready', 'High-energy scoring']
  },
  { 
    name: 'Tina Guo - Solo Cello', slug: 'tina-guo-solo-cello', category: 'Artist Series', 
    image: 'tina-guo-solo-cello.png',
    tagline: 'Intimate Cello Performance',
    description: 'Tina Guo Solo Cello provides an intimate, detailed solo cello sound. Perfect for emotional passages and expressive solo lines.',
    features: ['Intimate solo sound', 'Detailed sampling', 'Emotional expression', 'Solo line excellence']
  },
  { 
    name: 'Apocalyptica - Dark Cello', slug: 'apocalyptica-dark-cello', category: 'Artist Series', 
    image: 'apocalyptica.jpg',
    tagline: 'Cello Metal',
    description: 'Apocalyptica Dark Cello captures the legendary Finnish cello rock/metal band. Dark, aggressive, and powerful cello sounds for dramatic and intense scoring.',
    features: ['Apocalyptica sound', 'Dark and aggressive', 'Metal intensity', 'Powerful expression']
  },
  { 
    name: 'Taylor Davis - Violin', slug: 'taylor-davis-violin', category: 'Artist Series', 
    image: 'taylor-davis-violin.png',
    tagline: 'Expressive Solo Violin',
    description: 'Taylor Davis Violin captures the expressive playing style of YouTube sensation Taylor Davis. Perfect for contemporary, pop, and cinematic violin sounds.',
    features: ['Taylor Davis performance', 'Contemporary style', 'Expressive playing', 'Modern violin sound']
  },
  { 
    name: 'Gina Luciani - Cinema Flutes', slug: 'gina-luciani-cinema-flutes', category: 'Artist Series', 
    image: 'gina-luciani-cinema-flutes.png',
    tagline: 'Cinematic Flute',
    description: 'Gina Luciani Cinema Flutes captures the artistry of this renowned flutist. Beautiful, expressive flute sounds perfect for cinematic applications.',
    features: ['Gina Luciani performance', 'Cinematic flute sound', 'Expressive playing', 'Beautiful tone']
  },
  
  // WORLD
  { 
    name: 'Iceland', slug: 'iceland', category: 'World', 
    image: 'iceland.png',
    tagline: 'Icelandic Instruments',
    description: 'Iceland captures the unique musical instruments and sounds of this Nordic island. Haunting textures and folk instruments for atmospheric and cinematic scoring.',
    features: ['Icelandic instruments', 'Nordic character', 'Haunting textures', 'Atmospheric scoring']
  },
  { 
    name: 'Ireland', slug: 'ireland', category: 'World', 
    image: 'ireland.png',
    tagline: 'Irish Instruments',
    description: 'Ireland features traditional Irish instruments including whistles, uilleann pipes, and bodhran. Authentic Celtic sounds for folk and cinematic applications.',
    features: ['Traditional Irish instruments', 'Celtic sound', 'Whistles and pipes', 'Authentic character']
  },
  { 
    name: 'Scotland', slug: 'scotland', category: 'World', 
    image: 'scotland.png',
    tagline: 'Scottish Instruments',
    description: 'Scotland captures the distinctive sounds of Scottish music. Bagpipes, fiddles, and other traditional instruments for Celtic and cinematic scoring.',
    features: ['Scottish instruments', 'Bagpipes and fiddles', 'Celtic character', 'Cinematic applications']
  },
  { 
    name: 'South Africa', slug: 'south-africa', category: 'World', 
    image: 'south-africa.png',
    tagline: 'South African Instruments',
    description: 'South Africa explores the rich musical traditions of this diverse nation. Unique instruments and textures for world music and cinematic scoring.',
    features: ['South African instruments', 'Rich traditions', 'Unique textures', 'World music character']
  },
  { 
    name: 'Dulcimer and Zither', slug: 'dulcimer-and-zither', category: 'World', 
    image: 'dulcimer-and-zitherdulcimer.png',
    tagline: 'Folk String Instruments',
    description: 'Dulcimer and Zither captures these beautiful folk stringed instruments. Delicate, resonant, and perfect for folk, Americana, and world music.',
    features: ['Dulcimer and zither', 'Folk character', 'Delicate resonance', 'Americana sound']
  },
  { 
    name: 'Studio Banjo', slug: 'studio-banjo', category: 'World', 
    image: 'studio-banjosteel-string-resonator.png',
    tagline: 'Resonator Banjo',
    description: 'Studio Banjo delivers authentic banjo sounds with that distinctive ring. Perfect for Americana, country, folk, and cinematic applications.',
    features: ['Authentic banjo sound', 'Distinctive ring', 'Americana character', 'Country and folk']
  },
  { 
    name: 'Soundscapes', slug: 'soundscapes', category: 'World', 
    image: 'soundscapestonal-and-atonal-sound-design.png',
    tagline: 'Atmospheric Sound Design',
    description: 'Soundscapes provides atmospheric textures and sound design elements. Tonal and atonal sounds for creating mood and atmosphere in any production.',
    features: ['Atmospheric textures', 'Sound design elements', 'Tonal and atonal', 'Mood creation']
  },
  { 
    name: 'Orchestral Chords', slug: 'orchestral-chords', category: 'World', 
    image: 'orchestral-chordsorchestral-chords-and-octaves.png',
    tagline: 'Orchestral Ensemble Chords',
    description: 'Orchestral Chords provides instant orchestral chord progressions and octave doublings. Quick and easy orchestral sketching for any composer.',
    features: ['Instant orchestral chords', 'Quick sketching', 'Octave doublings', 'Easy orchestration']
  },
  { 
    name: 'Sketchpad: Monochrome', slug: 'sketchpad-monochrome', category: 'World', 
    image: 'sketchpad-monochromeorchestral-ensembles.png',
    tagline: 'Quick Orchestral Sketching',
    description: 'Sketchpad Monochrome enables rapid orchestral sketching with pre-combined ensemble sounds. Perfect for quickly mapping out ideas before full orchestration.',
    features: ['Rapid sketching', 'Pre-combined ensembles', 'Quick ideas', 'Orchestral planning']
  },
  { 
    name: 'Sew What', slug: 'sew-what', category: 'World', 
    image: 'sew-whatfound-sounds-and-fx.png',
    tagline: 'Found Sounds and FX',
    description: 'Sew What provides unique found sounds and creative effects. Unusual textures and percussive elements for experimental and creative scoring.',
    features: ['Found sounds', 'Creative effects', 'Unusual textures', 'Experimental scoring']
  },
  
  // SYNTHS
  { 
    name: 'Arp Quadra', slug: 'arp-quadra', category: 'Synths', 
    image: 'arp-quadra.png',
    tagline: 'Classic Analog Polysynth',
    description: 'The ARP Quadra was a groundbreaking synthesizer from 1978, combining four different sound sections into one instrument. This virtual recreation captures the warm, lush pads and distinctive character that made the original a studio favorite.',
    features: ['Warm analog pads', 'Layered sound design', 'Classic 70s/80s tones', 'Perfect for ambient and cinematic work']
  },
  { 
    name: 'Jupiter 6', slug: 'jupiter-6', category: 'Synths', 
    image: 'jupiter-6.png',
    tagline: 'Legendary Roland Polysynth',
    description: 'The Roland Jupiter-6 is one of the most sought-after analog synthesizers ever made. Known for its rich, warm sound and versatile architecture, this virtual instrument captures the essence of the original hardware.',
    features: ['Rich analog warmth', 'Classic Roland sound', 'Versatile synthesis', 'Iconic pads and leads']
  },
  { 
    name: 'Mono-Poly', slug: 'mono-poly', category: 'Synths', 
    image: 'mono-poly.png',
    tagline: 'Korg Analog Classic',
    description: 'The Korg Mono/Poly is a unique four-oscillator synthesizer that can function as either a monophonic or polyphonic instrument. Its distinctive sound has been featured in countless recordings.',
    features: ['Four oscillator design', 'Unique modulation', 'Aggressive leads', 'Thick unison sounds']
  },
  { 
    name: 'OBXa', slug: 'obxa', category: 'Synths', 
    image: 'obxa.png',
    tagline: 'Oberheim Analog Legend',
    description: 'The Oberheim OB-Xa is one of the most iconic synthesizers of the 1980s. Known for its massive, warm sound, it has been used on countless hit records and film scores.',
    features: ['Massive analog sound', 'Iconic brass and pads', 'Classic 80s character', 'Rich harmonic content']
  },
  { 
    name: 'Oberheim 4', slug: 'oberheim-4', category: 'Synths', 
    image: 'oberheim-4.png',
    tagline: 'Four Voice Analog Power',
    description: 'The Oberheim Four Voice was a groundbreaking polyphonic synthesizer. This virtual recreation captures its distinctive warm analog character.',
    features: ['Classic Oberheim tone', 'Warm analog character', 'Vintage sound design', 'Expressive performance']
  },
  { 
    name: 'Octave Cat', slug: 'octave-cat', category: 'Synths', 
    image: 'octave-cat.png',
    tagline: 'Vintage Duophonic Synth',
    description: 'The Octave Cat (CAT) was a popular synthesizer known for its aggressive sound and hands-on interface. This recreation brings its distinctive character to modern productions.',
    features: ['Aggressive analog sound', 'Classic filter', 'Versatile synthesis', 'Punchy leads and basses']
  },
  { 
    name: 'PPG Wave 2', slug: 'ppg-wave-2', category: 'Synths', 
    image: 'ppg-wave-2.png',
    tagline: 'Digital Wavetable Pioneer',
    description: 'The PPG Wave 2 was a revolutionary synthesizer that pioneered wavetable synthesis. Its unique digital/analog hybrid architecture created sounds unlike anything before it.',
    features: ['Wavetable synthesis', 'Unique digital character', 'Evolving textures', 'Iconic 80s sound']
  },
  { 
    name: 'Rhodes Chroma', slug: 'rhodes-chroma', category: 'Synths', 
    image: 'rhodes-chroma.png',
    tagline: 'ARP/Rhodes Hybrid Classic',
    description: 'The Rhodes Chroma was an advanced polyphonic synthesizer developed by ARP and later Rhodes. Known for its programmability and warm sound.',
    features: ['Advanced synthesis', 'Warm analog sound', 'Versatile programming', 'Classic tones']
  },
  { 
    name: 'Synergy', slug: 'synergy', category: 'Synths', 
    image: 'synergy.png',
    tagline: 'Digital Synthesis Pioneer',
    description: 'The Synergy was an advanced digital synthesizer known for its realistic acoustic instrument emulations and unique additive synthesis architecture.',
    features: ['Additive synthesis', 'Acoustic emulations', 'Unique character', 'Expressive sounds']
  },
  { 
    name: 'TB-303', slug: 'tb-303', category: 'Synths', 
    image: 'tb-303.png',
    tagline: 'Acid Bass Legend',
    description: 'The Roland TB-303 Bass Line is the most iconic bass synthesizer ever made. Originally designed for bass accompaniment, it became the defining sound of acid house and electronic music.',
    features: ['Iconic acid sound', 'Squelchy resonance', 'Classic patterns', 'Electronic music essential']
  },
  { 
    name: 'Vision - Modern Synths', slug: 'vision-modern-synths', category: 'Synths', 
    image: 'vision-modern-synths.png',
    tagline: 'Contemporary Sound Design',
    description: 'Vision Modern Synths brings contemporary synthesizer sounds to your productions. Featuring modern pads, leads, and textures perfect for film, TV, and game scoring.',
    features: ['Modern sound design', 'Cinematic textures', 'Contemporary pads', 'Scoring-ready sounds']
  },
  
  // DRUMS
  { 
    name: 'TR-808', slug: 'tr-808', category: 'Drums', 
    image: 'tr-808.png',
    tagline: 'The Drum Machine',
    description: 'The Roland TR-808 is arguably the most influential drum machine ever created. Its distinctive kick, snare, and hi-hats have defined hip-hop, electronic, and pop music for decades.',
    features: ['Iconic kick drum', 'Classic snare and claps', 'Signature hi-hats', 'Music history in a box']
  },
  { 
    name: 'TR-909', slug: 'tr-909', category: 'Drums', 
    image: 'tr-909.png',
    tagline: 'House & Techno Foundation',
    description: 'The Roland TR-909 is the backbone of house and techno music. Its punchy kick and crisp hi-hats have driven dancefloors worldwide since the mid-1980s.',
    features: ['Punchy analog kick', 'Crisp hi-hats', 'House music essential', 'Techno foundation']
  },
  { 
    name: 'TR-707', slug: 'tr-707', category: 'Drums', 
    image: 'tr-707.png',
    tagline: 'Digital Drum Classic',
    description: 'The Roland TR-707 brought digital drum sounds to the masses. Its clean, punchy sounds were featured on countless 80s records.',
    features: ['Clean digital drums', '80s character', 'Punchy sounds', 'Classic production tool']
  },
  { 
    name: 'TR-606', slug: 'tr-606', category: 'Drums', 
    image: 'tr-606.png',
    tagline: 'Drumatix Companion',
    description: 'The Roland TR-606 Drumatix was the companion to the TB-303, and together they defined the sound of acid house. Its lo-fi character remains beloved today.',
    features: ['Lo-fi character', 'Acid house essential', 'Companion to TB-303', 'Underground classic']
  },
  { 
    name: 'CR-78', slug: 'cr-78', category: 'Drums', 
    image: 'cr-78.png',
    tagline: 'Vintage Rhythm Box',
    description: 'The Roland CR-78 was one of the first programmable drum machines. Its distinctive sounds have been featured on classic records from Phil Collins to Blondie.',
    features: ['Vintage character', 'Classic drum sounds', 'Programmable patterns', 'Studio history']
  },
  { 
    name: 'CR-8000', slug: 'cr-8000', category: 'Drums', 
    image: 'cr-8000.png',
    tagline: 'CompuRhythm Classic',
    description: 'The Roland CR-8000 CompuRhythm combined analog drum sounds with digital control. Its warm, punchy character makes it perfect for electronic and pop productions.',
    features: ['Analog drum sounds', 'Digital control', 'Warm character', 'Versatile drum machine']
  },
  { 
    name: 'DMX', slug: 'dmx', category: 'Drums', 
    image: 'dmx.png',
    tagline: 'Oberheim Digital Drums',
    description: 'The Oberheim DMX was one of the most popular drum machines of the 1980s. Its punchy, sampled sounds defined the era and continue to be used today.',
    features: ['Sampled drum sounds', '80s character', 'Punchy and clean', 'Hip-hop classic']
  },
  { 
    name: 'SK-1', slug: 'sk-1', category: 'Drums', 
    image: 'sk-1.png',
    tagline: 'Lo-Fi Sampling Fun',
    description: 'The Casio SK-1 was a budget sampling keyboard that became a cult classic. Its lo-fi character and sampling capabilities have made it a favorite for creative sound design.',
    features: ['Lo-fi sampling', 'Creative character', 'Unique textures', 'Experimental tool']
  },
  { 
    name: 'Drums in Blue', slug: 'drums-in-blue', category: 'Drums', 
    image: 'drums-in-blueessential-jazz-drums.png',
    tagline: 'Essential Jazz Drums',
    description: 'Drums in Blue captures the warm, organic sound of a jazz drum kit. Perfect for intimate recordings, jazz productions, and any project needing natural acoustic drums.',
    features: ['Jazz drum kit', 'Warm organic sound', 'Intimate recordings', 'Natural dynamics']
  },
  { 
    name: 'Sunset Drums', slug: 'sunset-drums', category: 'Drums', 
    image: 'sunset-drumsmodern-rock-drums.png',
    tagline: 'Modern Rock Drums',
    description: 'Sunset Drums delivers powerful, modern rock drum sounds. Punchy kicks, cracking snares, and crisp cymbals ready for rock, pop, and indie productions.',
    features: ['Modern rock kit', 'Punchy and powerful', 'Radio-ready sound', 'Versatile rock drums']
  }
];

function generateProductPage(product) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${product.name} - Cinesamples Virtual Instruments</title>
    <meta name="description" content="${product.name} - ${product.tagline}. Professional virtual instrument from Cinesamples.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="../product-page.css">
    <link rel="icon" type="image/svg+xml" href="../images/cinesamples-logo.svg">
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <a href="/" class="logo"><img src="../images/cinesamples-logo.svg" alt="Cinesamples" class="logo-icon"></a>
            <div class="nav-links">
                <a href="/products.html" class="nav-link">Products</a>
                <a href="https://support.cinesamples.com" class="nav-link" target="_blank">Support</a>
                <a href="/#about" class="nav-link">About</a>
            </div>
            <a href="/products.html" class="btn btn-primary">Browse Products</a>
            <button class="mobile-menu-btn" aria-label="Menu"><span></span><span></span><span></span></button>
        </div>
    </nav>
    <div class="mobile-menu">
        <a href="/products.html" class="mobile-nav-link">Products</a>
        <a href="https://support.cinesamples.com" class="mobile-nav-link" target="_blank">Support</a>
        <a href="/#about" class="mobile-nav-link">About</a>
        <a href="/products.html" class="btn btn-primary btn-block">Browse Products</a>
    </div>

    <section class="product-hero">
        <div class="container">
            <div class="product-hero-content">
                <div class="product-hero-image">
                    <img src="../images/products/${product.image}" alt="${product.name}">
                </div>
                <div class="product-hero-info">
                    <div class="product-category-badge">${product.category}</div>
                    <h1>${product.name}</h1>
                    <p class="product-tagline">${product.tagline}</p>
                    <p class="product-description">${product.description}</p>
                    <div class="product-actions">
                        <span class="btn btn-primary btn-lg coming-soon-btn">Coming Soon to Musio</span>
                        <a href="/products.html" class="btn btn-secondary btn-lg">View All Products</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="product-features">
        <div class="container">
            <h2>Features</h2>
            <div class="features-grid">
                ${product.features.map(f => `<div class="feature-card">
                    <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                    <span>${f}</span>
                </div>`).join('\n                ')}
            </div>
        </div>
    </section>

    <section class="product-cta">
        <div class="container">
            <h2>Experience ${product.name}</h2>
            <p>${product.name} will be available soon on the Musio platform. Stay tuned for updates.</p>
            <a href="/products.html" class="btn btn-primary btn-lg">Explore More Products</a>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <a href="/" class="logo"><img src="../images/cinesamples-logo.svg" alt="Cinesamples" class="logo-icon"></a>
                    <p class="footer-tagline">Professional virtual instruments for film, TV, and game composers.</p>
                </div>
                <div class="footer-links">
                    <div class="footer-column"><h4>Products</h4><a href="/products.html">All Products</a><a href="/products.html#strings">Strings</a><a href="/products.html#brass">Brass</a></div>
                    <div class="footer-column"><h4>Company</h4><a href="/#about">About Us</a><a href="https://support.cinesamples.com" target="_blank">Support</a></div>
                    <div class="footer-column"><h4>Musio</h4><a href="https://musio.com" target="_blank">About Musio</a><a href="https://musio.com" target="_blank">Learn More</a></div>
                </div>
            </div>
            <div class="footer-bottom"><p>&copy; 2026 Cinesamples Inc. All rights reserved.</p></div>
        </div>
    </footer>
    <script src="../script.js"></script>
</body>
</html>`;
}

function main() {
  console.log('Generating product pages with full descriptions...');
  
  const productsDir = path.join(__dirname, '..', 'products');
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
  }
  
  for (const product of PRODUCTS) {
    const html = generateProductPage(product);
    const filePath = path.join(productsDir, `${product.slug}.html`);
    fs.writeFileSync(filePath, html);
    console.log(`  Created ${product.slug}.html`);
  }
  
  console.log(`\nGenerated ${PRODUCTS.length} product pages!`);
}

main();
