import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  GraduationCap,
  Code2,
  Briefcase,
  Award,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    studentProfile,
    currentProfile,
    setCurrentProfile,
    updateProfileField,
    resetProfileToDefault,
    sampleProfiles,
    loadSampleProfile,
    setActiveTab
  } = useApp();

  const profile = studentProfile || currentProfile;

  const [activeSection, setActiveSection] = useState<'personal' | 'education' | 'skills' | 'experience' | 'projects' | 'leadership'>('personal');
  const [saveToast, setSaveToast] = useState(false);

  // Skill text input helpers
  const [techSkillInput, setTechSkillInput] = useState('');
  const [progLangInput, setProgLangInput] = useState('');
  const [aiSkillInput, setAiSkillInput] = useState('');

  const triggerSaveNotification = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2200);
  };

  const handleAddSkill = (
    field: 'technicalSkills' | 'programmingLanguages' | 'aiMlSkills',
    val: string,
    setVal?: (s: string) => void
  ) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (!profile[field].includes(trimmed)) {
      updateProfileField(field, [...profile[field], trimmed]);
    }
    if (setVal) setVal('');
  };

  const handleRemoveSkill = (
    field: 'technicalSkills' | 'programmingLanguages' | 'aiMlSkills',
    item: string
  ) => {
    updateProfileField(field, profile[field].filter(s => s !== item));
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header with Sample Profiles Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Profile</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your verified academic credentials, coursework, research, and technical achievements.
          </p>
        </div>

        {/* Quick Sample Profile Loader */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Load Sample:</span>
          {Object.entries(sampleProfiles).map(([key, prof]) => (
            <button
              key={key}
              onClick={() => {
                loadSampleProfile(key);
                triggerSaveNotification();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                profile.name === prof.name
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {prof.name.split(' ')[0]} ({prof.fieldOfStudy.split(' ')[0]})
            </button>
          ))}

          <button
            onClick={() => {
              resetProfileToDefault();
              triggerSaveNotification();
            }}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1"
            title="Reset to default demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Main Form Layout: Left Sidebar Sections + Right Form Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="space-y-1">
          {[
            { id: 'personal', label: 'Personal & Citizenship', icon: User },
            { id: 'education', label: 'Education & Academic Standing', icon: GraduationCap },
            { id: 'skills', label: 'Technical & AI/ML Skills', icon: Code2 },
            { id: 'experience', label: 'Internships & Research', icon: Briefcase },
            { id: 'projects', label: 'Projects & Portfolio', icon: Sparkles },
            { id: 'leadership', label: 'Leadership & Honors', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-6">
            <button
              onClick={() => {
                triggerSaveNotification();
                setActiveTab('analyze');
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs text-center"
            >
              Proceed to Analysis →
            </button>
          </div>
        </div>

        {/* Form Panel */}
        <div className="md:col-span-3 bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* 1. PERSONAL INFORMATION */}
          {activeSection === 'personal' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">Personal & Identity Information</h3>
                <p className="text-xs text-slate-500">Crucial for deterministic citizenship and regional eligibility checking.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={currentProfile.name}
                    onChange={(e) => updateProfileField('name', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Elena Rostova"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Age (Optional)</label>
                  <input
                    type="number"
                    value={currentProfile.age || ''}
                    onChange={(e) => updateProfileField('age', e.target.value ? parseInt(e.target.value, 10) : null)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums"
                    placeholder="e.g. 21"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Country of Residence / Study</label>
                  <input
                    type="text"
                    value={currentProfile.country}
                    onChange={(e) => updateProfileField('country', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. United States"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nationality / Primary Citizenship</label>
                  <input
                    type="text"
                    value={currentProfile.nationality}
                    onChange={(e) => updateProfileField('nationality', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. American, Canadian, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. EDUCATION & ACADEMIC STANDING */}
          {activeSection === 'education' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">Education & Academic Record</h3>
                <p className="text-xs text-slate-500">GPA and degree levels are evaluated deterministically in code against opportunity rules.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Current Degree Program</label>
                  <input
                    type="text"
                    value={currentProfile.currentDegree}
                    onChange={(e) => updateProfileField('currentDegree', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Bachelor of Science"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Field of Study / Major</label>
                  <input
                    type="text"
                    value={currentProfile.fieldOfStudy}
                    onChange={(e) => updateProfileField('fieldOfStudy', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Computer Science & AI"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">University / College Institution</label>
                  <input
                    type="text"
                    value={currentProfile.university}
                    onChange={(e) => updateProfileField('university', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. University of Washington, Seattle"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Current Year / Semester Standing</label>
                  <input
                    type="text"
                    value={currentProfile.currentYearOrSemester}
                    onChange={(e) => updateProfileField('currentYearOrSemester', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. 3rd Year (Junior)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Expected Graduation Year</label>
                  <input
                    type="number"
                    value={currentProfile.expectedGraduationYear}
                    onChange={(e) => updateProfileField('expectedGraduationYear', parseInt(e.target.value, 10) || 2027)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums"
                    placeholder="e.g. 2027"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Cumulative GPA / CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={currentProfile.gpa}
                    onChange={(e) => updateProfileField('gpa', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums font-semibold"
                    placeholder="e.g. 3.82"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">GPA Scale</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentProfile.maxGpa || 4.0}
                    onChange={(e) => updateProfileField('maxGpa', parseFloat(e.target.value) || 4.0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums"
                    placeholder="e.g. 4.0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. SKILLS */}
          {activeSection === 'skills' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">Technical Skills & Tooling</h3>
                <p className="text-xs text-slate-500">Skills are cross-referenced by the analyzer against opportunity focus areas.</p>
              </div>

              {/* Quick suggestions */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
                <span className="font-semibold text-slate-700 block text-[11px]">Quick Add Common Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Python', 'Machine Learning', 'Data Science', 'Java', 'Research', 'C++', 'PyTorch', 'SQL'].map(suggested => (
                    <button
                      key={suggested}
                      type="button"
                      onClick={() => {
                        if (suggested === 'Python' || suggested === 'Java' || suggested === 'C++') {
                          handleAddSkill('programmingLanguages', suggested);
                        } else if (suggested === 'Machine Learning' || suggested === 'Data Science' || suggested === 'PyTorch') {
                          handleAddSkill('aiMlSkills', suggested);
                        } else {
                          handleAddSkill('technicalSkills', suggested);
                        }
                      }}
                      className="px-2 py-0.5 rounded text-[11px] bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                    >
                      + {suggested}
                    </button>
                  ))}
                </div>
              </div>

              {/* Programming Languages */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700">Programming Languages</label>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {currentProfile.programmingLanguages.map((lang) => (
                    <span
                      key={lang}
                      className="inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md"
                    >
                      <span>{lang}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill('programmingLanguages', lang)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1 max-w-sm">
                  <input
                    type="text"
                    value={progLangInput}
                    onChange={(e) => setProgLangInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill('programmingLanguages', progLangInput, setProgLangInput);
                      }
                    }}
                    placeholder="Add language (e.g. Rust, Kotlin)"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill('programmingLanguages', progLangInput, setProgLangInput)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Technical / Systems Skills */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="block text-xs font-medium text-slate-700">Technical & Systems Competencies</label>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {currentProfile.technicalSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill('technicalSkills', skill)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1 max-w-sm">
                  <input
                    type="text"
                    value={techSkillInput}
                    onChange={(e) => setTechSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill('technicalSkills', techSkillInput, setTechSkillInput);
                      }
                    }}
                    placeholder="Add skill (e.g. Distributed Systems)"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill('technicalSkills', techSkillInput, setTechSkillInput)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* AI & ML Skills */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="block text-xs font-medium text-slate-700">AI / ML / Data Science Frameworks</label>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {currentProfile.aiMlSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill('aiMlSkills', skill)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1 max-w-sm">
                  <input
                    type="text"
                    value={aiSkillInput}
                    onChange={(e) => setAiSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill('aiMlSkills', aiSkillInput, setAiSkillInput);
                      }
                    }}
                    placeholder="Add AI tool (e.g. PyTorch, JAX)"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill('aiMlSkills', aiSkillInput, setAiSkillInput)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. INTERNSHIPS & RESEARCH */}
          {activeSection === 'experience' && (
            <div className="space-y-6">
              {/* Internships */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Industry & Internship Experience</h3>
                    <p className="text-xs text-slate-500">Professional internships and work experience.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateProfileField('internships', [
                        ...currentProfile.internships,
                        { role: 'Intern', organization: 'Company Name', duration: '3 months', description: 'Describe your role and impact.' }
                      ]);
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Role</span>
                  </button>
                </div>

                <div className="space-y-3 pt-3">
                  {currentProfile.internships.map((intern, idx) => (
                    <div key={idx} className="p-3.5 border border-slate-200 rounded-lg space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => {
                          updateProfileField('internships', currentProfile.internships.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-600"
                        title="Remove entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pr-6">
                        <input
                          type="text"
                          value={intern.role}
                          onChange={(e) => {
                            const updated = [...currentProfile.internships];
                            updated[idx].role = e.target.value;
                            updateProfileField('internships', updated);
                          }}
                          placeholder="Job Title"
                          className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md font-medium"
                        />
                        <input
                          type="text"
                          value={intern.organization}
                          onChange={(e) => {
                            const updated = [...currentProfile.internships];
                            updated[idx].organization = e.target.value;
                            updateProfileField('internships', updated);
                          }}
                          placeholder="Company / Org"
                          className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                        />
                        <input
                          type="text"
                          value={intern.duration}
                          onChange={(e) => {
                            const updated = [...currentProfile.internships];
                            updated[idx].duration = e.target.value;
                            updateProfileField('internships', updated);
                          }}
                          placeholder="Duration (e.g. Summer 2025)"
                          className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={intern.description}
                        onChange={(e) => {
                          const updated = [...currentProfile.internships];
                          updated[idx].description = e.target.value;
                          updateProfileField('internships', updated);
                        }}
                        placeholder="Bullet points of responsibilities, technologies used, and measurable results."
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Research Experience */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Academic & Laboratory Research</h3>
                    <p className="text-xs text-slate-500">Undergraduate lab research, papers, or thesis projects.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateProfileField('researchExperience', [
                        ...currentProfile.researchExperience,
                        { title: 'Undergraduate Researcher', labOrMentor: 'Prof. Name / Lab', description: 'Describe research investigation.' }
                      ]);
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Research</span>
                  </button>
                </div>

                <div className="space-y-3 pt-3">
                  {currentProfile.researchExperience.map((res, idx) => (
                    <div key={idx} className="p-3.5 border border-slate-200 rounded-lg space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => {
                          updateProfileField('researchExperience', currentProfile.researchExperience.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-600"
                        title="Remove research"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                        <input
                          type="text"
                          value={res.title}
                          onChange={(e) => {
                            const updated = [...currentProfile.researchExperience];
                            updated[idx].title = e.target.value;
                            updateProfileField('researchExperience', updated);
                          }}
                          placeholder="Project / Topic Title"
                          className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md font-medium"
                        />
                        <input
                          type="text"
                          value={res.labOrMentor}
                          onChange={(e) => {
                            const updated = [...currentProfile.researchExperience];
                            updated[idx].labOrMentor = e.target.value;
                            updateProfileField('researchExperience', updated);
                          }}
                          placeholder="PI / Faculty Mentor / Lab"
                          className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={res.description}
                        onChange={(e) => {
                          const updated = [...currentProfile.researchExperience];
                          updated[idx].description = e.target.value;
                          updateProfileField('researchExperience', updated);
                        }}
                        placeholder="Methodologies, datasets, or theoretical findings."
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. PROJECTS */}
          {activeSection === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Technical Projects & Artifacts</h3>
                  <p className="text-xs text-slate-500">Autonomous systems, web applications, open-source code, or simulations.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateProfileField('projects', [
                      ...currentProfile.projects,
                      { title: 'New Project', techStack: ['Python'], description: 'Describe what problem this solves.' }
                    ]);
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {currentProfile.projects.map((proj, idx) => (
                  <div key={idx} className="p-3.5 border border-slate-200 rounded-lg space-y-2 relative">
                    <button
                      type="button"
                      onClick={() => {
                        updateProfileField('projects', currentProfile.projects.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...currentProfile.projects];
                          updated[idx].title = e.target.value;
                          updateProfileField('projects', updated);
                        }}
                        placeholder="Project Title"
                        className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md font-medium"
                      />
                      <input
                        type="text"
                        value={proj.techStack.join(', ')}
                        onChange={(e) => {
                          const updated = [...currentProfile.projects];
                          updated[idx].techStack = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          updateProfileField('projects', updated);
                        }}
                        placeholder="Tech Stack (comma separated: React, PyTorch)"
                        className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...currentProfile.projects];
                        updated[idx].description = e.target.value;
                        updateProfileField('projects', updated);
                      }}
                      placeholder="Features, architecture, user metrics, and links."
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. LEADERSHIP & HONORS */}
          {activeSection === 'leadership' && (
            <div className="space-y-6">
              {/* Leadership */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Leadership & Community Impact</h3>
                    <p className="text-xs text-slate-500">Student government, diversity initiatives, club officership, or mentorship.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateProfileField('leadership', [
                        ...currentProfile.leadership,
                        { role: 'Student Leader', organization: 'Campus Club', description: 'Details of service.' }
                      ]);
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Leadership</span>
                  </button>
                </div>

                <div className="space-y-3 pt-3">
                  {currentProfile.leadership.map((lead, idx) => (
                    <div key={idx} className="p-3.5 border border-slate-200 rounded-lg space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => {
                          updateProfileField('leadership', currentProfile.leadership.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                        <input
                          type="text"
                          value={lead.role}
                          onChange={(e) => {
                            const updated = [...currentProfile.leadership];
                            updated[idx].role = e.target.value;
                            updateProfileField('leadership', updated);
                          }}
                          placeholder="Leadership Title"
                          className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md font-medium"
                        />
                        <input
                          type="text"
                          value={lead.organization}
                          onChange={(e) => {
                            const updated = [...currentProfile.leadership];
                            updated[idx].organization = e.target.value;
                            updateProfileField('leadership', updated);
                          }}
                          placeholder="Student Org / Initiative"
                          className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={lead.description}
                        onChange={(e) => {
                          const updated = [...currentProfile.leadership];
                          updated[idx].description = e.target.value;
                          updateProfileField('leadership', updated);
                        }}
                        placeholder="Key initiatives launched, students mentored, or community outcomes."
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Honors & Awards */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Academic Honors & Certifications</h3>
                    <p className="text-xs text-slate-500">Dean’s List, hackathon wins, scholarships, professional certificates.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateProfileField('certificationsAwards', [
                        ...currentProfile.certificationsAwards,
                        { name: 'Award / Certificate', issuer: 'Issuer Org', year: '2025' }
                      ]);
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Honor</span>
                  </button>
                </div>

                <div className="space-y-3 pt-3">
                  {currentProfile.certificationsAwards.map((award, idx) => (
                    <div key={idx} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                        <input
                          type="text"
                          value={award.name}
                          onChange={(e) => {
                            const updated = [...currentProfile.certificationsAwards];
                            updated[idx].name = e.target.value;
                            updateProfileField('certificationsAwards', updated);
                          }}
                          placeholder="Honor / Award Name"
                          className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md font-medium"
                        />
                        <input
                          type="text"
                          value={award.issuer}
                          onChange={(e) => {
                            const updated = [...currentProfile.certificationsAwards];
                            updated[idx].issuer = e.target.value;
                            updateProfileField('certificationsAwards', updated);
                          }}
                          placeholder="Granting Institution"
                          className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                        />
                        <input
                          type="text"
                          value={award.year}
                          onChange={(e) => {
                            const updated = [...currentProfile.certificationsAwards];
                            updated[idx].year = e.target.value;
                            updateProfileField('certificationsAwards', updated);
                          }}
                          placeholder="Year (e.g. 2025)"
                          className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateProfileField('certificationsAwards', currentProfile.certificationsAwards.filter((_, i) => i !== idx));
                        }}
                        className="text-slate-400 hover:text-rose-600 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {saveToast ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Profile updated & saved to local storage</span>
                </span>
              ) : (
                'Changes persist automatically across sessions'
              )}
            </span>

            <button
              type="button"
              onClick={triggerSaveNotification}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
