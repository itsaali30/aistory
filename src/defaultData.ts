import { StoryScript } from './types';

export const defaultStoryScript: StoryScript = {
  stories: [
    {
      id_stories: 7,
      title: "Motu Patlu and the Kind Fairy",
      length: "90 sec",
      scenes_config: "18 scenes / 5sec each",
      story_content_en: "When a clumsy duo accidentally knocks a magical fairy's wand into a deep well, Furfuri Nagar turns upside down with chaotic magic. To fix their mistake, the food-loving hero must rely on the brainpower of his thin friend and a plate of hot samosas. Working together with the kind fairy, they retrieve the wand and restore peace to the town, proving that teamwork and a good heart can solve any magical mess.",
      story_content_hi: "जब एक नासमझ जोड़ी गलती से एक जादुई परी की छड़ी को एक गहरे कुएं में गिरा देती है, तो फुरफुरी नगर अराजक जादू से उल्टा-पुल्टा हो जाता है। अपनी गलती को सुधारने के लिए, भोजन प्रेमी नायक को अपने पतले दोस्त की बुद्धिमानी और गरमा-गरम समोसों की प्लेट पर भरोसा करना पड़ता है। दयालु परी के साथ मिलकर, वे छड़ी को वापस पाते हैं और शहर में शांति बहाल करते हैं, यह साबित करते हुए कि टीम वर्क और एक अच्छा दिल किसी भी जादुई गड़बड़ी को ठीक कर सकता है।",
      characters: [
        {
          id_character: 11,
          name: "Food-Loving Hero (Motu)",
          character_prompt: "A funny 3D animated man with a round belly, wearing a bright red tunic and blue vest, with a joyful and energetic face."
        },
        {
          id_character: 12,
          name: "The Clever Thinker (Patlu)",
          character_prompt: "A tall, very thin 3D animated man wearing a yellow tunic and glasses, looking thoughtful and intelligent."
        },
        {
          id_character: 13,
          name: "The Kind Fairy",
          character_prompt: "A beautiful 3D animated magical fairy wearing a glowing pink dress, with sparkling translucent wings and a gentle smile."
        }
      ],
      scenes: [
        {
          scene_id: 1,
          image_prompt: "A bright, sunny 3D animated village marketplace with colorful shops, cartoon style.",
          video_prompt: "The camera pans across the lively town square of Furfuri Nagar as villagers walk by, 5s.",
          audio_prompt_en: "Welcome to Furfuri Nagar, where everyday life is full of fun and surprises.",
          audio_prompt_hi: "फुरफुरी नगर में आपका स्वागत है, जहाँ रोज़मर्रा की ज़िंदगी मोज़े और सरप्राइज़ से भरी होती है।"
        },
        {
          scene_id: 2,
          image_prompt: "A gorgeous lush garden with a glowing stone well, a pink fairy looking around worriedly, 3D animated.",
          video_prompt: "Close up of the kind fairy searching near the ancient well, holding a magical sparkling wand that slips, 5s.",
          audio_prompt_en: "The beautiful fairy was visiting when her powerful wand accidentally fell deep into the mystical well.",
          audio_prompt_hi: "सुंदर परी सैर कर रही थी जब उसकी शक्तिशाली छड़ी दुर्घटनावश रहस्यमयी कुएं में गिर गई।"
        },
        {
          scene_id: 3,
          image_prompt: "Motu and Patlu sitting at a tea shop eating hot samosas, very colorful cartoon style.",
          video_prompt: "Motu eagerly grabs a samosa and smiles, while Patlu points at a sudden flash of light nearby, 5s.",
          audio_prompt_en: "Nearby, Motu was busy enjoying a fresh plate of samosas, completely unaware of the looming chaos.",
          audio_prompt_hi: "पास ही, मोटू समोसों की ताज़ा प्लेट का आनंद लेने में व्यस्त था, आने वाली गड़बड़ी से बिल्कुल बेखबर।"
        },
        {
          scene_id: 4,
          image_prompt: "Furfuri Nagar marketplace with floating objects, gravity reversed, people flying, 3D animated.",
          video_prompt: "Carts and fruits float in mid-air, Motu's plate of samosas starts flying up while Motu jumps to catch them, 5s.",
          audio_prompt_en: "Suddenly, the lost wand's wild magic burst out, reversing gravity and turning Furfuri Nagar upside down!",
          audio_prompt_hi: "अचानक, खोई हुई छड़ी का जंगली जादू फूट पड़ा, गुरुत्वाकर्षण को उल्टा कर दिया और फुरफुरी नगर को अस्त-व्यस्त कर दिया!"
        },
        {
          scene_id: 5,
          image_prompt: "An elegant, tall fairy crying softly next to a dry stone well, Motu and Patlu approaching her politely.",
          video_prompt: "Patlu points to his brain, reassuring the crying fairy as Motu munches on a floating samosa, 5s.",
          audio_prompt_en: "They found the distressed fairy. Patlu immediately formulated a brilliant plan using Motu's strength.",
          audio_prompt_hi: "उन्होंने दुखी परी को ढूंढ लिया। पतलू ने तुरंत मोटू की ताकत का उपयोग करके एक शानदार योजना बनाई।"
        },
        {
          scene_id: 6,
          image_prompt: "Motu tied to a sturdy vine being lowered into the well by Patlu and the fairy, bright magical lights inside the well.",
          video_prompt: "Motu goes down into the glowing well while giving a thumbs-up, looking determined, 5s.",
          audio_prompt_en: "Fueled by the promise of double samosas, Motu courageously descended into the glowing depths of the well.",
          audio_prompt_hi: "समोसे मिलने की लालच में, मोटू ने बहादुरी से चमकते हुए कुएं की गहराइयों में कदम रखा।"
        },
        {
          scene_id: 7,
          image_prompt: "Motu triumphantly holding a sparkling pink wand at the bottom of the well, surrounded by curious magical fish.",
          video_prompt: "Motu grabs the floating fairy wand and smiles widely, giving a giant thumbs up to the viewer, 5s.",
          audio_prompt_en: "At the bottom, he found the dazzling magic wand floating. Success was just one grab away!",
          audio_prompt_hi: "निचले हिस्से में, उसे चमचमाती जादुई छड़ी तैरती हुई मिली। सफलता बस एक हाथ की दूरी पर थी!"
        },
        {
          scene_id: 8,
          image_prompt: "The fairy happily waving her glowing wand, making floating villagers and carts settle gently back onto the ground.",
          video_prompt: "Sparkling pink stardust spreads over the village, returning gravity to normal, cartoon style, 5s.",
          audio_prompt_en: "With the wand returned, the kind fairy cast a gentle spell, restoring absolute balance and peace to Furfuri Nagar.",
          audio_prompt_hi: "छड़ी वापस मिलने पर, दयालु परी ने एक कोमल जादू किया, जिससे फुरफुरी नगर में संतुलन और शांति लौट आई।"
        }
      ]
    },
    {
      id_stories: 8,
      title: "The Legend of the Golden Samosa",
      length: "60 sec",
      scenes_config: "12 scenes / 5sec each",
      story_content_en: "A mysterious map leads our local champions on an excavation inside an ancient temple where the legendary Golden Samosa is rumored to grant infinite snack wishes. When Motu rushes in and triggers a giant boulder trap, Patlu uses geometry and friction to redirect the boulder, saving their lives. Having secured the legendary artifact, they decide to donate it to the museum in exchange for a lifetime supply of fresh hot samosas.",
      story_content_hi: "एक रहस्यमयी नक्शा हमारे स्थानीय नायकों को एक प्राचीन मंदिर के अंदर ले जाता है जहां पौराणिक स्वर्ण समोसा असीमित भोजन की इच्छाएं पूरी करता है। जब मोटू जल्दबाजी में अंदर जाता है और एक विशाल बोल्डर जाल को सक्रिय कर देता है, तो पतलू बोल्डर को मोड़ने के लिए ज्यामिति का उपयोग करता है। कलाकृति को सुरक्षित करके, वे इसे संग्रहालय को दान करने का निर्णय लेते हैं।",
      characters: [
        {
          id_character: 11,
          name: "Food-Loving Hero (Motu)",
          character_prompt: "A cheerful, round animated hero holding a rolled treasure map, wearing his signature red outfit."
        },
        {
          id_character: 12,
          name: "The Clever Thinker (Patlu)",
          character_prompt: "A thin cartoon intellectual wearing glasses, holding a giant magnifying glass, looking curious."
        },
        {
          id_character: 14,
          name: "Temple Guardian Statues",
          character_prompt: "Two friendly, animated stone elephant statues with sapphire eyes, standing at the temple gates."
        }
      ],
      scenes: [
        {
          scene_id: 1,
          image_prompt: "A deep, mysterious jungle temple entrance framed by lush green vines and ancient trees, cartoon style.",
          video_prompt: "Slow zoom in towards the temple gates where stone elephant statues stand guard, 5s.",
          audio_prompt_en: "Our heroes arrive at the lost temple, seeking the mythical Golden Samosa.",
          audio_prompt_hi: "पौराणिक स्वर्ण समोसे की तलाश में हमारे नायक खोए हुए मंदिर के द्वार पर पहुंचते हैं।"
        },
        {
          scene_id: 2,
          image_prompt: "An majestic chamber inside the temple with a glowing pedestal, on top of which sits a glittering golden samosa.",
          video_prompt: "The pedestal radiates shimmering amber light, illuminating the ancient carvings of the chamber, 5s.",
          audio_prompt_en: "There it was! The artifact that could grant infinite delicious samosas to the world.",
          audio_prompt_hi: "वहाँ था! वह जादुई कलाकृति जो दुनिया को असीमित स्वादिष्ट समोसे प्रदान कर सकती थी।"
        },
        {
          scene_id: 3,
          image_prompt: "Motu lunging forward excitedly while Patlu screams behind him, waving his hands to stop.",
          video_prompt: "Motu reaches out, completely ignoring the floor plate decorated with warning skull paintings, 5s.",
          audio_prompt_en: "Excited by the sight, Motu jumped ahead, triggering a hidden trap door!",
          audio_prompt_hi: "दृश्य से उत्साहित होकर, मोटू ने आगे छलांग लगा दी, और एक छिपा हुआ जाल सक्रिय हो गया!"
        },
        {
          scene_id: 4,
          image_prompt: "A huge round stone boulder rolling down a steep dark ramp inside the temple, directly towards Motu.",
          video_prompt: "The massive ancient stone ball rolls forward rapidly with sparks flying from its friction, 5s.",
          audio_prompt_en: "A giant stone boulder came crashing down our heroes' path! Speeding up every second.",
          audio_prompt_hi: "एक विशाल पथरीला गोला तेजी से नीचे लुढ़कने लगा, सीधे हमारे नायकों की ओर!"
        },
        {
          scene_id: 5,
          image_prompt: "Patlu using a sturdy wooden beam as a lever to redirect the dynamic rolling boulder into a deep side pit.",
          video_prompt: "With a swift motion of lever science, the boulder gets diverted and crashes harmlessly into the pit, 5s.",
          audio_prompt_en: "Using quick physics calculations, Patlu levered a beam just in time, diverting the threat.",
          audio_prompt_hi: "त्वरित भौतिकी गणनाओं का उपयोग करते हुए, पतलू ने समय रहते विशाल पत्थर को मोड़ दिया।"
        },
        {
          scene_id: 6,
          image_prompt: "Motu and Patlu celebrating outside the temple, hold the sparkling golden samosa high up in the sunlight.",
          video_prompt: "Both dance joyously as warm midday light cascades over the jungle, 5s.",
          audio_prompt_en: "Safe at last, they claimed the legendary treasure. Furfuri Nagar stays proud and well-fed!",
          audio_prompt_hi: "सुरक्षित होकर उन्होंने पौराणिक खजाने पर अधिकार कर लिया। फुरफुरी नगर गौरवान्वित और आनंदित है!"
        }
      ]
    }
  ]
};
