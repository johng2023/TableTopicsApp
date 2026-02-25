import { supabase } from './supabase';

export const TABLE_TOPICS = [
  "If you could have dinner with any historical figure, who would it be and why?",
  "What is the best piece of advice you've ever received?",
  "If you could master any skill instantly, what would it be?",
  "Describe your perfect day from start to finish.",
  "What book has had the biggest impact on your life?",
  "If you could live in any era, which would you choose?",
  "What is one thing you would change about the education system?",
  "Describe a moment when you felt truly proud of yourself.",
  "If you could solve one world problem, what would it be?",
  "What does success mean to you?",
  "If you could start any business, what would it be?",
  "What is the most important quality in a friend?",
  "Describe a time when failure taught you something valuable.",
  "If you could have any superpower for a day, what would it be?",
  "What tradition do you think should be started?",
  "How has technology changed the way we communicate?",
  "What is your favorite way to spend a weekend?",
  "If you could learn the answer to one question, what would you ask?",
  "What motivates you to keep going when things get tough?",
  "Describe the best trip you've ever taken.",
  "What is one thing you wish you had learned earlier in life?",
  "If you could give your younger self one piece of advice, what would it be?",
  "What does leadership mean to you?",
  "Describe a person who has inspired you.",
  "If you could change one thing about yourself, what would it be?",
  "What is the most courageous thing you've ever done?",
  "How do you define happiness?",
  "What is one goal you hope to achieve this year?",
  "If you could witness any event in history, what would it be?",
  "What role does failure play in success?",
];

export function getRandomPrompt(): string {
  return TABLE_TOPICS[Math.floor(Math.random() * TABLE_TOPICS.length)];
}

export interface Recording {
  id: string;
  prompt: string;
  audioUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  createdAt: Date;
}

export async function saveRecording(recording: Omit<Recording, 'videoUrl' | 'thumbnailUrl'> & {
  videoBlob: Blob;
  thumbnailBlob?: Blob;
}): Promise<void> {
  const { videoBlob, thumbnailBlob, ...meta } = recording;

  // Upload video
  const isMP4 = videoBlob.type.includes('mp4');
  const videoPath = `videos/${meta.id}.${isMP4 ? 'mp4' : 'webm'}`;
  const contentType = isMP4 ? 'video/mp4' : 'video/webm';
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('recordings')
    .upload(videoPath, videoBlob, { contentType });
  
  console.log('Upload result:', uploadData, uploadError);

  if (uploadError) {
    console.error('Video upload failed:', uploadError);
    throw new Error(uploadError.message || 'Video upload failed');
  }

  const { data: videoData } = supabase.storage.from('recordings').getPublicUrl(videoPath);

  // Save metadata to database
  await supabase.from('recordings').insert({
    id: meta.id,
    device_id: getDeviceId(), // add this
    prompt: meta.prompt,
    video_url: videoData.publicUrl,
    thumbnail_url: '',
    duration: meta.duration,
    created_at: meta.createdAt.toISOString(),
  });

}

function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

export async function getRecordings(): Promise<Recording[]> {
  const { data, error } = await supabase
  .from('recordings')
  .select('*')
  .eq('device_id', getDeviceId()) // add this
  .order('created_at', { ascending: false });


  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    prompt: r.prompt,
    audioUrl: '',
    videoUrl: r.video_url,
    thumbnailUrl: r.thumbnail_url,
    duration: r.duration,
    createdAt: new Date(r.created_at),
  }));
}

export async function deleteRecording(id: string): Promise<void> {
  await supabase.storage.from('recordings').remove([`videos/${id}.webm`, `thumbnails/${id}.jpg`]);
  await supabase.from('recordings').delete().eq('id', id);
}