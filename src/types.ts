export interface Character {
  id_character: number;
  name: string;
  character_prompt: string;
}

export interface Scene {
  scene_id: number;
  image_prompt: string;
  video_prompt: string;
  audio_prompt_en: string;
  audio_prompt_hi: string;
}

export interface Story {
  id_stories: number;
  title: string;
  length: string;
  scenes_config: string;
  story_content_en: string;
  story_content_hi: string;
  characters: Character[];
  scenes: Scene[];
}

export interface StoryScript {
  stories: Story[];
}

export type SelectedField =
  | 'scene_id'
  | 'image_prompt'
  | 'video_prompt'
  | 'audio_prompt_en'
  | 'audio_prompt_hi'
  | 'character_prompt';
