import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Settings, 
  FileJson, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Sparkles, 
  Edit3, 
  Plus, 
  Trash2, 
  BookOpen, 
  User, 
  Film, 
  Languages, 
  FileText, 
  RefreshCw,
  PlusCircle,
  HelpCircle,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { defaultStoryScript } from './defaultData';
import { StoryScript, Story, Scene, Character, SelectedField } from './types';

export default function App() {
  // Application states
  const [scriptData, setScriptData] = useState<StoryScript>(defaultStoryScript);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number>(0);
  const [selectedField, setSelectedField] = useState<SelectedField>('audio_prompt_hi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Interaction/UI states
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isPasteOpen, setIsPasteOpen] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [pasteValue, setPasteValue] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal and custom addition states
  const [editingScene, setEditingScene] = useState<{ storyIdx: number; sceneIdx: number } | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<{ storyIdx: number; charIdx: number } | null>(null);
  const [isAddingStory, setIsAddingStory] = useState<boolean>(false);

  // New Story Form state
  const [newStoryTitle, setNewStoryTitle] = useState<string>('');
  const [newStoryLength, setNewStoryLength] = useState<string>('90 sec');
  const [newStoryConfig, setNewStoryConfig] = useState<string>('18 scenes / 5sec each');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger brief alert messages/toast simulation
  const triggerToast = (msg: string, isError: boolean = false) => {
    if (isError) {
      setJsonError(msg);
      setTimeout(() => setJsonError(null), 5000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // Safe file parsing with fault tolerance and structural correction
  const handleJSONParse = (rawText: string, sourceName: string) => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(rawText);
      let correctedScript: StoryScript = { stories: [] };

      // Case 1: Ideal structure { stories: [...] }
      if (parsed && Array.isArray(parsed.stories)) {
        correctedScript = parsed as StoryScript;
      } 
      // Case 2: Array of stories direct [...]
      else if (Array.isArray(parsed)) {
        correctedScript = { stories: parsed };
      } 
      // Case 3: Single story object
      else if (parsed && (parsed.title || parsed.scenes)) {
        correctedScript = { stories: [parsed] };
      } 
      // Fallback
      else {
        throw new Error("Invalid structure. The JSON must contain a story block, list of stories, or list of scenes.");
      }

      // Deep sanitize to guarantee no missing fields crash the visualizer
      correctedScript.stories = correctedScript.stories.map((story, sIdx) => {
        return {
          id_stories: story.id_stories || sIdx + 1,
          title: story.title || `Untitled Story ${sIdx + 1}`,
          length: story.length || "60 sec",
          scenes_config: story.scenes_config || "12 scenes / 5sec each",
          story_content_en: story.story_content_en || "",
          story_content_hi: story.story_content_hi || "",
          characters: Array.isArray(story.characters) ? story.characters.map((char: any, cIdx: number) => ({
            id_character: char.id_character || cIdx + 1,
            name: char.name || `Character ${cIdx + 1}`,
            character_prompt: char.character_prompt || ""
          })) : [],
          scenes: Array.isArray(story.scenes) ? story.scenes.map((scene: any, scIdx: number) => ({
            scene_id: scene.scene_id || scIdx + 1,
            image_prompt: scene.image_prompt || "",
            video_prompt: scene.video_prompt || "",
            audio_prompt_en: scene.audio_prompt_en || "",
            audio_prompt_hi: scene.audio_prompt_hi || ""
          })) : []
        };
      });

      if (correctedScript.stories.length === 0) {
        throw new Error("No stories detected inside the valid JSON container.");
      }

      setScriptData(correctedScript);
      setSelectedStoryIndex(0);
      setUploadedFileName(sourceName);
      triggerToast(`Successfully loaded ${correctedScript.stories.length} story script(s)!`);
      setIsPasteOpen(false);
    } catch (err: any) {
      console.error(err);
      triggerToast(`Parsing Error: ${err.message || "Invalid JSON syntax"}`, true);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/json" || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            handleJSONParse(event.target.result as string, file.name);
          }
        };
        reader.readAsText(file);
      } else {
        triggerToast("Please drop a valid .json file.", true);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleJSONParse(event.target.result as string, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePasteSubmit = () => {
    if (!pasteValue.trim()) {
      triggerToast("Please paste some JSON first.", true);
      return;
    }
    handleJSONParse(pasteValue, "Pasted Raw Text");
  };

  // Helper: extract selected focal values of selection option across current active story
  const currentStory = scriptData.stories[selectedStoryIndex] || scriptData.stories[0];

  const getFocalValues = (): { id: string | number; text: string; source: string }[] => {
    if (!currentStory) return [];
    
    if (selectedField === 'character_prompt') {
      return (currentStory.characters || []).map(char => ({
        id: `Char ${char.id_character}`,
        text: char.character_prompt || '',
        source: char.name
      }));
    }

    return (currentStory.scenes || []).map(scene => {
      let val = '';
      if (selectedField === 'scene_id') val = `Scene #${scene.scene_id}`;
      else if (selectedField === 'image_prompt') val = scene.image_prompt;
      else if (selectedField === 'video_prompt') val = scene.video_prompt;
      else if (selectedField === 'audio_prompt_en') val = scene.audio_prompt_en;
      else if (selectedField === 'audio_prompt_hi') val = scene.audio_prompt_hi;

      return {
        id: `Scene ${scene.scene_id}`,
        text: val,
        source: `Scene ${scene.scene_id}`
      };
    });
  };

  // Copy entire list of focal values to clipboard
  const handleCopyFocalAll = () => {
    const list = getFocalValues();
    const formattedText = list.map(item => `[${item.source}] ${item.text}`).join('\n\n');
    navigator.clipboard.writeText(formattedText);
    setCopiedText("all_focal");
    setTimeout(() => setCopiedText(null), 2000);
    triggerToast("Copied all focal values to clipboard!");
  };

  // Copy individual text
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Download modified JSON
  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scriptData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const filename = uploadedFileName 
      ? uploadedFileName.replace(/\.json$/, "_fitted.json") 
      : "story_script_fitted.json";
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast("Fitted JSON successfully downloaded!");
  };

  // Edit fields directly in local state
  const handleUpdateSceneField = (sceneIdx: number, fieldName: keyof Scene, value: any) => {
    setScriptData(prev => {
      const updatedStories = [...prev.stories];
      const story = { ...updatedStories[selectedStoryIndex] };
      const scenes = [...story.scenes];
      scenes[sceneIdx] = { ...scenes[sceneIdx], [fieldName]: value };
      story.scenes = scenes;
      updatedStories[selectedStoryIndex] = story;
      return { stories: updatedStories };
    });
  };

  const handleUpdateCharacterField = (charIdx: number, fieldName: keyof Character, value: any) => {
    setScriptData(prev => {
      const updatedStories = [...prev.stories];
      const story = { ...updatedStories[selectedStoryIndex] };
      const characters = [...story.characters];
      characters[charIdx] = { ...characters[charIdx], [fieldName]: value };
      story.characters = characters;
      updatedStories[selectedStoryIndex] = story;
      return { stories: updatedStories };
    });
  };

  const handleUpdateStoryMetadata = (fieldName: keyof Story, value: string) => {
    setScriptData(prev => {
      const updatedStories = [...prev.stories];
      updatedStories[selectedStoryIndex] = {
        ...updatedStories[selectedStoryIndex],
        [fieldName]: value
      };
      return { stories: updatedStories };
    });
  };

  // Create new scene inside currently selected story
  const handleAddScene = () => {
    if (!currentStory) return;
    const nextId = currentStory.scenes.length > 0 
      ? Math.max(...currentStory.scenes.map(s => s.scene_id)) + 1 
      : 1;
    
    const newScene: Scene = {
      scene_id: nextId,
      image_prompt: "Enter image description prompt...",
      video_prompt: "Enter video instructions prompt...",
      audio_prompt_en: "Enter English narrative audio prompt...",
      audio_prompt_hi: "हिंदी नैरेटिव ऑडियो प्रॉम्प्ट दर्ज करें..."
    };

    setScriptData(prev => {
      const updatedStories = [...prev.stories];
      const story = { ...updatedStories[selectedStoryIndex] };
      story.scenes = [...story.scenes, newScene];
      updatedStories[selectedStoryIndex] = story;
      return { stories: updatedStories };
    });
    triggerToast(`Added Scene #${nextId}`);
  };

  // Delete scene from current story
  const handleDeleteScene = (sceneId: number) => {
    setScriptData(prev => {
      const updatedStories = [...prev.stories];
      const story = { ...updatedStories[selectedStoryIndex] };
      story.scenes = story.scenes.filter(s => s.scene_id !== sceneId);
      updatedStories[selectedStoryIndex] = story;
      return { stories: updatedStories };
    });
    triggerToast(`Deleted Scene #${sceneId}`);
  };

  // Create new character
  const handleAddCharacter = () => {
    if (!currentStory) return;
    const nextId = currentStory.characters.length > 0
      ? Math.max(...currentStory.characters.map(c => c.id_character)) + 1
      : 11;
    
    const newChar: Character = {
      id_character: nextId,
      name: `New Character ${nextId}`,
      character_prompt: "A beautiful 3D model character design..."
    };

    setScriptData(prev => {
      const updatedStories = [...prev.stories];
      const story = { ...updatedStories[selectedStoryIndex] };
      story.characters = [...story.characters, newChar];
      updatedStories[selectedStoryIndex] = story;
      return { stories: updatedStories };
    });
    triggerToast(`Added Character "${newChar.name}"`);
  };

  // Delete matching character
  const handleDeleteCharacter = (charId: number) => {
    setScriptData(prev => {
      const updatedStories = [...prev.stories];
      const story = { ...updatedStories[selectedStoryIndex] };
      story.characters = story.characters.filter(c => c.id_character !== charId);
      updatedStories[selectedStoryIndex] = story;
      return { stories: updatedStories };
    });
    triggerToast("Deleted character successfully.");
  };

  // Create a brand new story 
  const handleCreateNewStory = () => {
    if (!newStoryTitle.trim()) {
      triggerToast("Story title is required.", true);
      return;
    }
    const newStoryObj: Story = {
      id_stories: scriptData.stories.length > 0 ? Math.max(...scriptData.stories.map(s => s.id_stories)) + 1 : 1,
      title: newStoryTitle,
      length: newStoryLength,
      scenes_config: newStoryConfig,
      story_content_en: "Enter overarching english story synopsis here...",
      story_content_hi: "यहाँ मुख्य हिंदी कहानी का सारांश दर्ज करें...",
      characters: [
        { id_character: 1, name: "Protagonist", character_prompt: "A sleek 3D style protagonist..." }
      ],
      scenes: [
        {
          scene_id: 1,
          image_prompt: "Establishing wide shot of beautiful futuristic cityscape, cartoon 3D style.",
          video_prompt: "The camera orbits slowly over the glowing spires, 5s.",
          audio_prompt_en: "In a world of infinite imagination, the adventure begins.",
          audio_prompt_hi: "असीम कल्पना की दुनिया में, रोमांच शुरू होता है।"
        }
      ]
    };

    setScriptData(prev => ({
      stories: [...prev.stories, newStoryObj]
    }));
    setSelectedStoryIndex(scriptData.stories.length);
    setIsAddingStory(false);
    setNewStoryTitle('');
    triggerToast(`Created new story: "${newStoryTitle}"!`);
  };

  // Helper word count
  const countWords = (str: string) => {
    if (!str) return 0;
    return str.split(/\s+/).filter(Boolean).length;
  };

  // Filter scenes based on overall search input
  const filteredScenes = currentStory?.scenes.filter(scene => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return (
      scene.scene_id.toString().includes(term) ||
      scene.image_prompt.toUpperCase().includes(term.toUpperCase()) ||
      scene.video_prompt.toUpperCase().includes(term.toUpperCase()) ||
      scene.audio_prompt_en.toUpperCase().includes(term.toUpperCase()) ||
      scene.audio_prompt_hi.toUpperCase().includes(term.toUpperCase())
    );
  }) || [];

  return (
    <div className="min-h-screen bg-vibrant-bg font-sans selection:bg-vibrant-orange/20 selection:text-vibrant-orange pb-6 antialiased" id="story-visualizer-root">
      
      {/* Dynamic Action Toasts / Notifications */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-vibrant-blue text-white border border-vibrant-blue/20 shadow-2xl px-5 py-3 rounded-xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-vibrant-orange animate-pulse" />
            <span className="text-sm font-semibold tracking-wide">{successMessage}</span>
          </motion.div>
        )}
        
        {jsonError && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white shadow-2xl px-5 py-3 rounded-xl flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-white shrink-0" />
            <span className="text-sm font-semibold tracking-wide">{jsonError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styled Top Decorative Nav matching .vibrant-header */}
      <nav className="bg-vibrant-orange text-white shadow-lg sticky top-0 z-30 font-sans" id="main-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Brand Logo Layout */}
            <div className="flex items-center gap-3" id="brand-logo-container">
              <div className="p-2.5 bg-vibrant-blue rounded-xl text-white shadow-md flex items-center justify-center">
                <FileJson className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight font-display text-white">
                  STORY_GEN v2.1
                </h1>
                <p className="text-xs opacity-95">JSON Workflow & Scene Processor</p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-3" id="nav-action-buttons">
              <button 
                id="toggle-raw-paste-btn"
                onClick={() => setIsPasteOpen(!isPasteOpen)}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all duration-200 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                  isPasteOpen 
                    ? 'bg-vibrant-blue text-white border-vibrant-blue shadow-inner' 
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Raw JSON Pad
              </button>

              {currentStory && (
                <button
                  id="nav-direct-download-btn"
                  onClick={handleDownloadJSON}
                  className="bg-vibrant-blue hover:bg-vibrant-blue-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-transparent cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export JSON</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* App Main Layout Grid Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* SECTION A: File Drag and Paste Drawer */}
        <div className="mb-8" id="json-importer-container">
          <AnimatePresence initial={false}>
            {isPasteOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-vibrant-blue text-white rounded-2xl p-6 border border-vibrant-blue/20 shadow-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-vibrant-orange animate-pulse" />
                      <h4 className="text-sm font-bold tracking-wide uppercase font-display">Direct JSON Paste Workshop</h4>
                    </div>
                    <span className="text-[10px] font-mono text-white/70">Real-time Node Injection</span>
                  </div>

                  <textarea
                    id="paste-code-input-textarea"
                    className="w-full h-44 p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-transparent placeholder:text-slate-600"
                    placeholder={`Paste story script JSON content here... Example:\n{\n  "stories": [\n    {\n      "id_stories": 7,\n      "title": "My Adventure",\n      "scenes": [\n        { "scene_id": 1, "audio_prompt_hi": "..." }\n      ]\n    }\n  ]\n}`}
                    value={pasteValue}
                    onChange={(e) => setPasteValue(e.target.value)}
                  />

                  <div className="flex justify-end gap-3 mt-4">
                    <button 
                      onClick={() => {
                        setPasteValue('');
                        setJsonError(null);
                      }}
                      className="text-xs hover:text-white text-slate-300 px-4 py-2 hover:bg-white/10 rounded-xl transition cursor-pointer"
                    >
                      Reset Pad
                    </button>
                    <button 
                      id="submit-pasted-raw-json"
                      onClick={handlePasteSubmit}
                      className="bg-vibrant-orange hover:bg-vibrant-orange-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl uppercase tracking-wider shadow-md cursor-pointer"
                    >
                      Parse JSON Stream
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DRAG AND DROP ZONE */ }
        </div>

        {/* Start Responsive Grid Layout Workspace with Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="application-flow-grid">
          
          {/* SIDEBAR CONTAINER */}
          <aside className="col-span-1 lg:col-span-4 space-y-6" id="dashboard-sidebar-controls">
            
            {/* FILE DRAG & DROP ZONE (Vibrant Dropzone style) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-fade-in" id="uploader-card">
              <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-1.5 font-sans">
                <Upload className="w-4 h-4 text-vibrant-orange animate-bounce-slow" />
                Script Source Input
              </h3>

              <div 
                id="file-drop-zone"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`drop-zone-vibrant relative py-8 px-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center border-2 border-dashed ${
                  dragActive ? 'scale-[1.02] bg-orange-100/30 border-vibrant-orange' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/50'
                }`}
              >
                <input 
                  ref={fileInputRef}
                  type="file"
                  id="story-uploader-input"
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 text-vibrant-orange">
                  <Upload className="w-6 h-6 animate-pulse" />
                </div>

                <h4 className="text-xs font-bold text-vibrant-orange uppercase tracking-wider mb-1">
                  Drop JSON file here
                </h4>
                <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto mb-2 font-semibold font-sans">
                  or tap to browse your local filesystem
                </p>

                {uploadedFileName ? (
                  <div className="text-[10px] font-mono font-black text-white bg-vibrant-blue px-2.5 py-1 rounded-full inline-block truncate max-w-[180px] mt-1 shadow-sm">
                    📄 {uploadedFileName}
                  </div>
                ) : (
                  <div className="text-[9px] text-slate-400 italic mt-1 leading-normal max-w-[170px] mx-auto font-sans">
                    Currently: Sample Cartoon Scripts
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-1.5 mt-3">
                <button 
                  id="browse-local-files-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="bg-vibrant-blue hover:bg-vibrant-blue-hover text-white text-[10px] uppercase tracking-wider font-extrabold px-3.5 py-2 rounded-lg transition shadow-sm cursor-pointer"
                >
                  Browse File
                </button>
                <button 
                  id="reset-to-adventure-samples-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setScriptData(defaultStoryScript);
                    setUploadedFileName(null);
                    setSelectedStoryIndex(0);
                    triggerToast("Reset workspace environment to standard adventure samples!");
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] uppercase tracking-wider font-extrabold px-3.5 py-1.5 rounded-lg transition border border-slate-200 cursor-pointer"
                >
                  Reset Sample
                </button>
              </div>
            </div>

            {/* DYNAMIC OPTION FITTER (Focal Field Select options) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-fade-in" id="option-fitter-controls font-sans">
              <div className="mb-4">
                <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5 font-sans">
                  <Settings className="w-4 h-4 text-vibrant-orange animate-spin-slow" />
                  Option Fitter Control
                </h3>
                <p className="text-slate-500 text-[10px] mt-1 leading-normal font-sans">
                  Select key field option targeted for focal visual highlight and active system extraction.
                </p>
              </div>

              {/* Selector Pills in alignment with standard pill class */}
              <div className="space-y-2" id="pills-selection-container">
                {[
                  { id: 'scene_id', label: 'Scene ID', desc: 'Step index', color: 'bg-emerald-500' },
                  { id: 'image_prompt', label: 'Image Prompt', desc: 'Graphic style', color: 'bg-blue-500' },
                  { id: 'video_prompt', label: 'Video Prompt', desc: 'Frame motion', color: 'bg-violet-500' },
                  { id: 'audio_prompt_en', label: 'Audio Prompt (EN)', desc: 'Narrator track', color: 'bg-teal-500' },
                  { id: 'audio_prompt_hi', label: 'Audio Prompt (HI)', desc: 'Hindi dialogue (Default)', color: 'bg-amber-500' },
                  { id: 'character_prompt', label: 'Character Prompt', desc: 'Vibe traits text', color: 'bg-rose-500' },
                ].map((field) => {
                  const isActive = selectedField === field.id;
                  return (
                    <button
                      key={field.id}
                      id={`pill-btn-${field.id}`}
                      onClick={() => {
                        setSelectedField(field.id as SelectedField);
                        triggerToast(`Option fitter focused on "${field.label}"`);
                      }}
                      className={`w-full flex items-center justify-between text-left transition-all duration-150 rounded-xl px-4 py-2.5 border text-xs font-bold cursor-pointer ${
                        isActive 
                          ? 'bg-vibrant-blue text-white border-vibrant-blue shadow-md scale-[1.01]' 
                          : 'bg-slate-50 hover:bg-slate-100/70 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${field.color}`} />
                        <div>
                          <p className="font-bold leading-tight">{field.label}</p>
                          <p className={`text-[9px] font-mono leading-none mt-0.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                            {field.desc}
                          </p>
                        </div>
                      </div>
                      
                      {isActive && (
                        <span className="text-[8px] uppercase tracking-wider font-extrabold bg-[#FF6321] text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                          Fitted
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Shorthand focal output listing for fast feedback */}
              <div className="mt-5 bg-slate-50 border border-slate-150 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#94A3B8] font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-vibrant-orange animate-spin-slow" />
                    Focal Prompt Stream
                  </span>
                  <button
                    id="copy-focal-sidebar-btn"
                    onClick={handleCopyFocalAll}
                    className="text-[9px] font-mono text-vibrant-orange hover:text-vibrant-orange-hover border border-vibrant-orange/20 px-2 py-1 rounded bg-vibrant-orange/5 font-extrabold transition cursor-pointer"
                  >
                    {copiedText === 'all_focal' ? 'Copied Stream!' : 'Copy Stream'}
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto rounded bg-slate-900 border border-slate-950 p-2.5 font-mono text-[10px] text-slate-300 space-y-1.5 scrollbar-thin format-mono">
                  {getFocalValues().map((focal, index) => (
                    <div key={index} className="flex gap-1.5 pb-1.5 border-b border-slate-800 last:border-0 last:pb-0">
                      <span className="text-vibrant-orange shrink-0 font-bold">#{focal.id}:</span>
                      <span className="text-slate-100 select-all truncate">{focal.text || 'No text defined'}</span>
                    </div>
                  ))}
                  {getFocalValues().length === 0 && (
                    <div className="text-slate-500 italic text-center py-2 font-sans text-[10px]">
                      No active focal prompt stream records.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </aside>

          {/* WORKSTATION CONTAINER - RIGHT COLUMN */}
          <section className="col-span-1 lg:col-span-8 space-y-6" id="dashboard-story-workspace">

        {/* SECTION C: Active Story Selector with Statistics */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm" id="story-switcher-panel-card">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="story-switcher-panel">
            <div className="flex flex-wrap gap-2">
              {scriptData.stories.map((story, idx) => {
                const isActive = idx === selectedStoryIndex;
                return (
                  <button
                    key={story.id_stories}
                    id={`story-tab-${idx}`}
                    onClick={() => {
                      setSelectedStoryIndex(idx);
                      triggerToast(`Switched active story to "${story.title}"`);
                    }}
                    className={`text-xs font-bold px-4 py-3 rounded-xl transition duration-150 flex items-center gap-2 border cursor-pointer ${
                      isActive 
                        ? 'bg-vibrant-blue text-white border-vibrant-blue shadow-md' 
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <BookOpen className={`w-3.5 h-3.5 ${isActive ? 'text-vibrant-orange' : 'text-slate-400'}`} />
                    <span className="line-clamp-1 max-w-[200px]">{story.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {story.scenes.length} Scenes
                    </span>
                  </button>
                );
              })}

              {/* Add Story Button Trigger */}
              <button
                id="add-story-open-btn"
                onClick={() => setIsAddingStory(!isAddingStory)}
                className="text-xs font-extrabold uppercase tracking-wide px-4 py-3 rounded-xl transition bg-vibrant-orange hover:bg-vibrant-orange-hover text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 animate-bounce-slow" />
                Add Story
              </button>
            </div>

            {/* Quick Metrics Indicator */}
            {currentStory && (
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shrink-0 flex gap-4 font-bold font-sans">
                <div>Duration: <span className="text-vibrant-blue font-black">{currentStory.length}</span></div>
                <div className="border-l border-slate-200 pl-4">Config: <span className="text-vibrant-orange font-black">{currentStory.scenes_config}</span></div>
              </div>
            )}
          </div>

          {/* Form to append a new physical story */}
          {isAddingStory && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl mb-6"
            >
              <h4 className="text-sm font-bold font-sans uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-vibrant-orange animate-pulse" /> Add New Story Script Block
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase font-mono text-[10px]">Story Name / Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Alien meets Samosa Vendor"
                    value={newStoryTitle}
                    onChange={(e) => setNewStoryTitle(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrant-blue focus:border-transparent font-sans font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase font-mono text-[10px]">Story Duration (length)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 90 sec"
                    value={newStoryLength}
                    onChange={(e) => setNewStoryLength(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrant-blue focus:border-transparent font-sans font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase font-mono text-[10px]">Scenes Layout Configuration</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 18 scenes / 5sec each"
                    value={newStoryConfig}
                    onChange={(e) => setNewStoryConfig(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrant-blue focus:border-transparent font-sans font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsAddingStory(false)}
                  className="text-xs font-bold hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-lg cursor-pointer transition uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewStory}
                  className="bg-vibrant-blue hover:bg-vibrant-blue-hover text-white text-xs font-black px-5 py-2 rounded-lg shadow-md cursor-pointer transition uppercase tracking-wider"
                >
                  Validate & Create Story
                </button>
              </div>
            </motion.div>
          )}

          {/* Active Story Workspace details */}
          {currentStory ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="workspace-card-wrapper">
              
              {/* Story Header & Title Metadata Editing */}
              <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1 w-full">
                    <div className="text-[10px] tracking-wider uppercase font-mono font-bold text-vibrant-orange">Active Story Workspace</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input 
                        type="text"
                        value={currentStory.title}
                        onChange={(e) => handleUpdateStoryMetadata('title', e.target.value)}
                        className="text-xl font-black font-sans text-slate-900 border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-vibrant-blue focus:outline-none bg-transparent py-0.5 max-w-lg w-full"
                        title="Click to edit story title directly"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto uppercase tracking-wide text-[10px] font-bold">
                    <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl flex items-center gap-1.5 text-slate-700 shadow-xs">
                      <Film className="w-3.5 h-3.5 text-vibrant-blue" />
                      <span className="font-mono font-black text-xs text-vibrant-blue">{currentStory.scenes.length}</span>
                      <span className="text-slate-400 font-sans tracking-tight">Scenes</span>
                    </div>
                    <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl flex items-center gap-1.5 text-slate-700 shadow-xs">
                      <User className="w-3.5 h-3.5 text-vibrant-orange" />
                      <span className="font-mono font-black text-xs text-vibrant-orange">{currentStory.characters.length}</span>
                      <span className="text-slate-400 font-sans tracking-tight">Casting</span>
                    </div>
                  </div>
                </div>

                {/* Side-by-Side English and Hindi Story Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
                  
                  {/* English Synopsis Card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-all duration-150">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
                        <Languages className="w-3.5 h-3.5 text-vibrant-blue animate-pulse" />
                        <span className="font-sans font-bold text-slate-800">Story Content (English)</span>
                        <span className="text-[10px] text-slate-400 font-mono">({countWords(currentStory.story_content_en)} words)</span>
                      </div>
                      <textarea
                        rows={3}
                        value={currentStory.story_content_en}
                        onChange={(e) => handleUpdateStoryMetadata('story_content_en', e.target.value)}
                        className="w-full text-xs text-slate-700 leading-relaxed bg-transparent border-0 focus:ring-0 focus:outline-none resize-none placeholder:text-slate-400 font-sans font-medium"
                        placeholder="Define general English storyboard flow..."
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 text-right font-mono mt-2 font-bold uppercase tracking-wide">English Canvas</div>
                  </div>

                  {/* Hindi Synopsis Card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-all duration-150">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
                        <Languages className="w-3.5 h-3.5 text-vibrant-orange animate-pulse" />
                        <span className="font-sans font-bold text-slate-800">कहानी सामग्री (Hindi Summary)</span>
                        <span className="text-[10px] text-slate-400 font-mono">({countWords(currentStory.story_content_hi)} words)</span>
                      </div>
                      <textarea
                        rows={3}
                        value={currentStory.story_content_hi}
                        onChange={(e) => handleUpdateStoryMetadata('story_content_hi', e.target.value)}
                        className="w-full text-xs text-slate-700 leading-relaxed bg-transparent border-0 focus:ring-0 focus:outline-none resize-none placeholder:text-slate-400 font-sans font-medium"
                        placeholder="कहानी का मुख्य सारांश हिंदी में यहाँ लिखें..."
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 text-right font-mono mt-2 font-bold uppercase tracking-wide">Hindi Canvas</div>
                  </div>

                </div>
              </div>

              {/* Characters Directory Subsection */}
              <div className="px-6 py-5 border-b border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-vibrant-orange animate-bounce-slow" />
                    <h4 className="text-xs font-black tracking-wider uppercase text-slate-800 font-sans">Character Casting & Profiles</h4>
                  </div>
                  <button 
                    onClick={handleAddCharacter}
                    className="text-[10px] font-black uppercase tracking-wider text-vibrant-blue bg-vibrant-blue/5 hover:bg-vibrant-blue/10 border border-vibrant-blue/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Character
                  </button>
                </div>

                {/* Character list grids */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentStory.characters.map((char, charIdx) => {
                    const isFocalCharacterField = selectedField === 'character_prompt';
                    return (
                      <div 
                        key={char.id_character}
                        className={`p-4 rounded-xl border relative transition-all duration-200 ${
                          isFocalCharacterField 
                            ? 'bg-rose-50/70 border-rose-300 shadow-sm ring-1 ring-rose-300/20' 
                            : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/30 hover:shadow-xs'
                        }`}
                      >
                        {/* Delete Character Button */}
                        <button 
                          onClick={() => handleDeleteCharacter(char.id_character)}
                          className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 duration-150 p-1 cursor-pointer"
                          title="Delete Character object"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                        <div className="flex items-center gap-2.5 mb-2.5">
                          <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs text-white ${
                            isFocalCharacterField ? 'bg-rose-500 shadow-sm animate-pulse' : 'bg-slate-800'
                          }`}>
                            {char.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={char.name}
                              onChange={(e) => handleUpdateCharacterField(charIdx, 'name', e.target.value)}
                              className="text-xs font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-vibrant-blue focus:outline-none w-full"
                              title="Click to rename character"
                            />
                            <div className="text-[9px] font-mono text-slate-400 tracking-wide font-bold">CHAR ID: {char.id_character}</div>
                          </div>
                        </div>

                        {/* Character Prompt Field */}
                        <div className="relative">
                          <textarea
                            rows={2}
                            value={char.character_prompt}
                            onChange={(e) => handleUpdateCharacterField(charIdx, 'character_prompt', e.target.value)}
                            className={`w-full text-xs text-slate-600 leading-relaxed bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrant-blue focus:border-transparent ${
                              isFocalCharacterField ? 'ring-2 ring-rose-300/40 border-rose-300 bg-rose-50/30 font-semibold text-rose-950' : ''
                            }`}
                            placeholder="Introduce appearance, dress, visual vibe prompts..."
                          />
                          
                          {/* Focal Action Indicator */}
                          {isFocalCharacterField && (
                            <div className="absolute right-2 bottom-2 text-[8px] bg-rose-500 text-white font-mono px-1.5 rounded uppercase font-black tracking-wider animate-pulse flex items-center gap-0.5">
                              <Sparkles className="w-2 h-2" /> Fitted Focus
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {currentStory.characters.length === 0 && (
                    <div className="col-span-3 py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 italic">
                      No characters listed yet. Press "+ Character" above to add.
                    </div>
                  )}
                </div>
              </div>

              {/* SEARCH BAR & SCENE TIMELINE MANAGER */}
              <div className="px-6 py-5 bg-slate-50/40 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-widest">
                    <Film className="w-4 h-4 text-vibrant-orange animate-bounce-slow" />
                    <span>Storyboards & Scene Timeline</span>
                  </div>
                  <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider font-extrabold mt-0.5">All scene instructions structured chronologically.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Search box */}
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search prompts/scenes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-xs pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vibrant-blue focus:border-transparent w-full sm:w-56 font-sans font-semibold"
                    />
                  </div>

                  {/* Add Scene Button */}
                  <button 
                    onClick={handleAddScene}
                    className="bg-vibrant-blue hover:bg-vibrant-blue-hover text-white text-[10px] uppercase tracking-wider font-extrabold px-4 py-2 rounded-xl transition flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Scene
                  </button>
                </div>
              </div>

              {/* THE TIMELINE SCENE LIST CARDS (Main core visualization) */}
              <div className="p-6 bg-slate-50/20">
                <div className="space-y-6">
                  {filteredScenes.map((scene, sceneIdx) => {
                    return (
                      <div 
                        key={scene.scene_id}
                        id={`scene-timeline-item-${scene.scene_id}`}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-150 overflow-hidden flex flex-col md:flex-row"
                      >
                        
                        {/* LEFT COLUMN: Scene Label, Actions */}
                        <div className="bg-slate-900 text-white p-5 md:w-36 shrink-0 flex flex-row md:flex-col justify-between items-center md:items-start border-r border-slate-800" id={`scene-sidebar-${scene.scene_id}`}>
                          <div>
                            <div className="text-[10px] tracking-widest font-mono text-[#94A3B8] uppercase font-bold">Scene Frame</div>
                            <div className="text-3xl font-black font-sans text-white mt-1.5 flex items-baseline gap-1">
                              #{scene.scene_id}
                              <span className="text-xs text-slate-400 font-light font-mono">/ {currentStory.scenes.length}</span>
                            </div>
                          </div>

                          <div className="flex md:flex-col gap-2 mt-4 w-full">
                            <button
                              onClick={() => {
                                const formattedText = `[Scene #${scene.scene_id}]\nImage: ${scene.image_prompt}\nVideo: ${scene.video_prompt}\nEN: ${scene.audio_prompt_en}\nHI: ${scene.audio_prompt_hi}`;
                                handleCopyText(`all_scene_${scene.scene_id}`, formattedText);
                                triggerToast(`Copied Scene #${scene.scene_id} full card content!`);
                              }}
                              className="text-[9px] bg-white/10 hover:bg-white/20 text-white font-mono py-1.5 px-2.5 rounded-lg hover:text-white transition w-full text-center flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider cursor-pointer"
                            >
                              {copiedText === `all_scene_${scene.scene_id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              Copy Code
                            </button>

                            <button
                              onClick={() => handleDeleteScene(scene.scene_id)}
                              className="text-[9px] bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-mono py-1.5 px-2.5 rounded-lg transition w-full text-center flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider cursor-pointer"
                              title="Delete current scene permanently"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* RIGHT COLUMNS: The actual prompt fields and option fitted container */}
                        <div className="flex-1 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Top row: Video/Image prompts */}
                          <div className="space-y-3.5">
                            
                            {/* IMAGE PROMPT FIELD */}
                            <div className={`p-3 rounded-xl border relative transition-all duration-150 ${
                              selectedField === 'image_prompt' 
                                ? 'bg-vibrant-blue/5 border-vibrant-blue shadow-sm ring-1 ring-vibrant-blue/30' 
                                : 'bg-slate-50 border-slate-200'
                            }`}>
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] font-mono tracking-wider uppercase font-extrabold flex items-center gap-1 ${selectedField === 'image_prompt' ? 'text-vibrant-blue font-black' : 'text-slate-500'}`}>
                                  🎨 Image Prompt
                                  {selectedField === 'image_prompt' && (
                                    <span className="text-[7px] bg-vibrant-blue text-white px-1.5 py-0.2 rounded font-mono font-bold uppercase animate-pulse">
                                      Active Option Focus
                                    </span>
                                  )}
                                </span>
                                <button 
                                  onClick={() => handleCopyText(`img_${scene.scene_id}`, scene.image_prompt)}
                                  className="text-slate-400 hover:text-vibrant-blue transition p-1 cursor-pointer"
                                  title="Copy Image Prompt prompt"
                                >
                                  {copiedText === `img_${scene.scene_id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                              <textarea
                                value={scene.image_prompt}
                                onChange={(e) => handleUpdateSceneField(sceneIdx, 'image_prompt', e.target.value)}
                                className={`w-full text-xs text-slate-700 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none leading-relaxed focus:bg-white/80 p-1.5 rounded transition ${
                                  selectedField === 'image_prompt' ? 'font-bold text-slate-900 bg-white/20' : ''
                                }`}
                                rows={2}
                                placeholder="Describe the environment, characters, cartoon style..."
                              />
                            </div>

                            {/* VIDEO PROMPT FIELD */}
                            <div className={`p-3 rounded-xl border relative transition-all duration-150 ${
                              selectedField === 'video_prompt' 
                                ? 'bg-vibrant-orange/5 border-vibrant-orange shadow-sm ring-1 ring-vibrant-orange/30' 
                                : 'bg-slate-50 border-slate-200'
                            }`}>
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] font-mono tracking-wider uppercase font-extrabold flex items-center gap-1 ${selectedField === 'video_prompt' ? 'text-vibrant-orange font-black' : 'text-slate-500'}`}>
                                  🎬 Video Generation directions
                                  {selectedField === 'video_prompt' && (
                                    <span className="text-[7px] bg-vibrant-orange text-white px-1.5 py-0.2 rounded font-mono font-bold uppercase animate-pulse">
                                      Active Option Focus
                                    </span>
                                  )}
                                </span>
                                <button 
                                  onClick={() => handleCopyText(`vid_${scene.scene_id}`, scene.video_prompt)}
                                  className="text-slate-400 hover:text-vibrant-orange transition p-1 cursor-pointer"
                                  title="Copy video directions prompt"
                                >
                                  {copiedText === `vid_${scene.scene_id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                              <textarea
                                value={scene.video_prompt}
                                onChange={(e) => handleUpdateSceneField(sceneIdx, 'video_prompt', e.target.value)}
                                className={`w-full text-xs text-slate-700 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none leading-relaxed focus:bg-white/80 p-1.5 rounded transition ${
                                  selectedField === 'video_prompt' ? 'font-bold text-slate-900 bg-white/20' : ''
                                }`}
                                rows={2}
                                placeholder="Directions (panning, zoom, camera rotation, duration)..."
                              />
                            </div>

                          </div>

                          {/* Bottom Row : Audio narrative prompts */}
                          <div className="space-y-3.5">
                            
                            {/* AUDIO NARRATIVE ENGLISH */}
                            <div className={`p-3 rounded-xl border relative transition-all duration-150 ${
                              selectedField === 'audio_prompt_en' 
                                ? 'bg-vibrant-blue/5 border-vibrant-blue shadow-sm ring-1 ring-vibrant-blue/30' 
                                : 'bg-slate-50 border-slate-200'
                            }`}>
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] font-mono tracking-wider uppercase font-extrabold flex items-center gap-1 ${selectedField === 'audio_prompt_en' ? 'text-vibrant-blue font-black' : 'text-slate-500'}`}>
                                  🔊 Audio Prompt Dialogue (English)
                                  {selectedField === 'audio_prompt_en' && (
                                    <span className="text-[7px] bg-vibrant-blue text-white px-1.5 py-0.2 rounded font-mono font-bold uppercase animate-pulse">
                                      Active Option Focus
                                    </span>
                                  )}
                                </span>
                                <button 
                                  onClick={() => handleCopyText(`auden_${scene.scene_id}`, scene.audio_prompt_en)}
                                  className="text-slate-400 hover:text-vibrant-blue transition p-1 cursor-pointer"
                                  title="Copy english audio narrative"
                                >
                                  {copiedText === `auden_${scene.scene_id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                              <textarea
                                value={scene.audio_prompt_en}
                                onChange={(e) => handleUpdateSceneField(sceneIdx, 'audio_prompt_en', e.target.value)}
                                className={`w-full text-xs text-slate-700 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none leading-relaxed focus:bg-white/80 p-1.5 rounded transition ${
                                  selectedField === 'audio_prompt_en' ? 'font-bold text-slate-900 bg-white/20' : ''
                                }`}
                                rows={2}
                                placeholder="Enter voice narrator narrative..."
                              />
                            </div>

                            {/* AUDIO NARRATIVE HINDI (Default selected field highlight!) */}
                            <div className={`p-3 rounded-xl border relative transition-all duration-300 ${
                              selectedField === 'audio_prompt_hi' 
                                ? 'bg-vibrant-orange/5 border-[#FF7D45] ring-4 ring-[#FF7D45]/15' 
                                : 'bg-slate-50 border-slate-200'
                            }`}>
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] font-mono tracking-wider uppercase font-extrabold flex items-center gap-1 ${
                                  selectedField === 'audio_prompt_hi' ? 'text-vibrant-orange font-black' : 'text-slate-500'
                                }`}>
                                  🗣️ ऑडियो डायलॉग (Audio Narrative Hindi)
                                  {selectedField === 'audio_prompt_hi' && (
                                    <span className="text-[7px] bg-vibrant-orange text-white px-1.5 py-0.2 rounded font-mono font-bold uppercase animate-pulse inline">
                                      Default Focal Highlight
                                    </span>
                                  )}
                                </span>
                                <button 
                                  onClick={() => handleCopyText(`audhi_${scene.scene_id}`, scene.audio_prompt_hi)}
                                  className="text-slate-400 hover:text-vibrant-orange transition p-1 cursor-pointer"
                                  title="Copy hindi audio narrative prompt"
                                >
                                  {copiedText === `audhi_${scene.scene_id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                              <textarea
                                value={scene.audio_prompt_hi}
                                onChange={(e) => handleUpdateSceneField(sceneIdx, 'audio_prompt_hi', e.target.value)}
                                className={`w-full text-xs text-slate-700 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none leading-relaxed focus:bg-white/80 p-1.5 rounded transition ${
                                  selectedField === 'audio_prompt_hi' ? 'font-bold text-amber-950 bg-amber-50/20' : ''
                                }`}
                                rows={2}
                                placeholder="हिंदी डायलॉग या वायसओवर स्क्रिप्ट यहाँ दर्ज करें..."
                              />
                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  })}

                  {filteredScenes.length === 0 && (
                    <div className="py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
                      <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm font-semibold">No scenes match your keyword "{searchQuery}"</p>
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-indigo-500 hover:underline mt-1 font-bold"
                      >
                        Clear filter keywords
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-100 rounded-3xl p-12 text-center border-2 border-dashed border-slate-350">
              <FileJson className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No Story Scripts Uploaded</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Please drop a story script JSON file above or add a new workspace manually to begin filtering.</p>
            </div>
          )}

        </div>

        {/* SECTION D: Live JSON Code Inspector & Dynamic Export Block */}
        <div className="mt-8 bg-[#0D1B2A] text-white rounded-2xl overflow-hidden shadow-xl border border-[#1B263B]" id="live-code-exporter-panel">
          
          <div className="px-6 py-5 border-b border-[#132A43]/80 bg-[#0B132B] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="text-xs uppercase tracking-wider font-extrabold font-sans text-white flex items-center gap-1.5">
                <FileCodeIcon className="w-4 h-4 text-vibrant-orange animate-pulse" /> Live Dynamic Output Code Block
              </h4>
              <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider font-extrabold mt-0.5">Real-time compilation reflecting local edits instantly.</p>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(scriptData, null, 2));
                  triggerToast("Full JSON structure copied safely!");
                }}
                className="bg-white/10 hover:bg-white/20 text-slate-100 text-[10px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> Copy JSON
              </button>
              
              <button 
                onClick={handleDownloadJSON}
                className="bg-vibrant-blue hover:bg-vibrant-blue-hover text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Save File
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#0B132B]">
            <pre className="text-[11px] font-mono leading-relaxed text-teal-400 p-5 bg-[#070D1F] max-h-80 overflow-y-auto rounded-xl border border-[#132A43] scrollbar-thin font-bold">
              {JSON.stringify(scriptData, null, 2)}
            </pre>
          </div>

        </div>

          </section> {/* Close dashboard-story-workspace col-span-8 */}

        </div> {/* Close application-flow-grid 12-column template layout */}

        {/* FOOTER BAR DEFINITION */}
        <footer className="mt-12 pt-6 border-t border-slate-200/60 pb-8 flex flex-col sm:flex-row justify-between items-center text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold" id="application-visual-footer">
          <div>Story Script Visualizer &bull; Fitted Storyboards</div>
          <div className="mt-2 sm:mt-0 text-slate-400">STORY_GEN v2.1 &bull; Ambient Screen Controls &bull; 2026</div>
        </footer>

      </main>

    </div>
  );
}

// Simple internal icon
function FileCodeIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
