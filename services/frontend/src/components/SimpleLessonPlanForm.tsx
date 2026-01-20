import { useState } from "react";
import { LessonPlan } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sparkles, Dices } from "lucide-react";

type SimpleLessonPlanFormProps = {
  initialData?: LessonPlan;
  onSubmit: (plan: Omit<LessonPlan, "id" | "createdAt">) => void;
  onCancel: () => void;
};

const MAJORS = [
  "General Studies",
  "Computer Science",
  "Philosophy",
  "Xenobiology",
  "Quantum Physics",
  "Hyper-History",
  "Artificial Intelligence",
  "Cyber-Archaeology",
  "Astro-Engineering"
];

const CURIOUS_TOPICS = [
  { title: "The Ethics of Sentient AI", subject: "Philosophy", description: "Exploring the moral implications of creating conscious machines.", difficulty: 5 },
  { title: "Photosynthesis in Low-Light Exoplanets", subject: "Xenobiology", description: "Adapting plant life to red dwarf star systems.", difficulty: 8 },
  { title: "Quantum Computing for Toddlers", subject: "Computer Science", description: "Basic superposition concepts explained with blocks.", difficulty: 2 },
  { title: "The Fall of the Roman Empire (Re-Simulated)", subject: "Hyper-History", description: "Analyzing alternative outcomes if Caesar lived.", difficulty: 6 },
  { title: "Dyson Sphere Maintenance 101", subject: "Astro-Engineering", description: "Safety protocols for working near stars.", difficulty: 4 }
];

import { useAuth } from "../contexts/AuthContext";

export function SimpleLessonPlanForm({ initialData, onSubmit, onCancel }: SimpleLessonPlanFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialData?.title || "");
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [difficulty, setDifficulty] = useState(initialData?.grade ? parseInt(initialData.grade) : 5); // reusing grade as difficulty number for now? Or keep grade string?
  // The Prompt asked for "1-10 dropdown of course difficulty". 
  // LessonPlan.grade is a string. We can store "Level 5" or just input key.
  // Actually, let's map the dropdown 1-10 to the `grade` string field for compatibility.

  const [description, setDescription] = useState(initialData?.description || "");

  // Defaults for hidden fields
  const [duration, setDuration] = useState("Self-Paced");
  const [teacherName, setTeacherName] = useState(user?.name || user?.email || "Talos AI");
  const [objectives, setObjectives] = useState<string[]>(["Master the basics"]);
  const [materials, setMaterials] = useState<string[]>(["Digital Textbook"]);
  const [activities, setActivities] = useState<string[]>(["Review", "Quiz"]);

  const handleRandomize = () => {
    const randomTopic = CURIOUS_TOPICS[Math.floor(Math.random() * CURIOUS_TOPICS.length)];
    setTitle(randomTopic.title);
    setSubject(randomTopic.subject);
    setDescription(randomTopic.description);
    setDifficulty(randomTopic.difficulty);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      subject,
      grade: `Level ${difficulty}`, // Mapping difficulty number to Grade string
      description,
      duration,
      teacherName,
      objectives,
      materials,
      activities,
      isPublic: true,
      password: "",
    });
  };

  return (
    <div className="space-y-4">
      <Card className="bg-stone-900 border-amber-900/20 rounded-none">
        <CardHeader className="border-b border-stone-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-amber-500 uppercase tracking-widest text-lg font-bold">
              Rapid Course Genesis
            </CardTitle>
            <CardDescription className="text-stone-500 text-xs">
              Configure parameters for instant generation
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleRandomize}
            className="border-amber-500/50 text-amber-500 hover:bg-amber-950/30 uppercase tracking-widest text-xs gap-2"
          >
            <Sparkles className="w-4 h-4" />
            I'm Feeling Curious
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-2">
              <Label className="uppercase tracking-widest text-[10px] text-stone-400">Course Identifier</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Course Title"
                required
                className="bg-stone-950 border-amber-900/30 text-stone-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase tracking-widest text-[10px] text-stone-400">Academic Major</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="bg-stone-950 border-amber-900/30 text-stone-200">
                    <SelectValue placeholder="Select Discipline" />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900 border-amber-900/30 text-stone-200">
                    {MAJORS.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="uppercase tracking-widest text-[10px] text-stone-400">Difficulty Matrix (1-10)</Label>
                <Select value={difficulty.toString()} onValueChange={(v) => setDifficulty(parseInt(v))}>
                  <SelectTrigger className="bg-stone-950 border-amber-900/30 text-stone-200">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900 border-amber-900/30 text-stone-200">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v: number) => (
                      <SelectItem key={v} value={v.toString()}>Level {v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="uppercase tracking-widest text-[10px] text-stone-400">Abstract</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Course Description"
                rows={4}
                required
                className="bg-stone-950 border-amber-900/30 text-stone-200 font-mono text-sm"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-none border-stone-700 text-stone-400 uppercase">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 rounded-none bg-amber-700 hover:bg-amber-600 text-stone-950 font-bold uppercase">
                Initialize
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}