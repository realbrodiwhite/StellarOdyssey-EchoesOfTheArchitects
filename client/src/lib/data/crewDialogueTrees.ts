import { CompanionPersonality, DialogueType, RelationshipLevel } from "../stores/useCompanion";

// Define a dialogue option that the player can select
export interface DialogueOption {
  id: string;
  text: string;
  relationshipEffect?: number; // Positive or negative impact on relationship
  requiredRelationship?: RelationshipLevel; // Minimum relationship level required
  nextNodeId?: string; // Which node to go to next
  specialEffects?: {
    type: 'unlock' | 'reward' | 'mission' | 'insight';
    value: string;
  }[];
}

// Define a dialogue node in the conversation tree
export interface DialogueNode {
  id: string;
  text: string; // What the crew member says
  speakerId: string; // ID of the crew member speaking
  type: DialogueType;
  options: DialogueOption[]; // Possible player responses
  contextTriggers?: {
    location?: string;
    mission?: string;
    gameEvent?: string;
    characterClass?: string;
  };
  onEntryEffects?: {
    type: 'animation' | 'sound' | 'background' | 'notification';
    value: string;
  }[];
}

// Define a complete conversation tree
export interface DialogueTree {
  id: string;
  title: string;
  description: string;
  startNodeId: string;
  nodes: DialogueNode[];
  availability: {
    requiredRelationship?: RelationshipLevel;
    requiredProgress?: number;
    requiredLocation?: string;
    requiredMission?: string;
    requiredPersonality?: CompanionPersonality;
  };
}

// Collection of dialogue trees organized by crew member and context
export const crewDialogueTrees: DialogueTree[] = [
  // Get to know your crew member dialogue tree
  {
    id: "get-to-know-engineer",
    title: "Getting to Know Your Engineer",
    description: "Learn more about your engineer crew member's background and expertise.",
    startNodeId: "engineer-intro",
    nodes: [
      {
        id: "engineer-intro",
        text: "Need something, Captain? I was just calibrating the propulsion systems. There's always something to tinker with on a ship like this.",
        speakerId: "engineer",
        type: DialogueType.Greeting,
        options: [
          {
            id: "ask-background",
            text: "How did you end up as an engineer in deep space?",
            nextNodeId: "engineer-background"
          },
          {
            id: "ask-expertise",
            text: "What systems on the ship are you specialized in?",
            nextNodeId: "engineer-expertise"
          },
          {
            id: "ask-opinion",
            text: "What do you think of our mission so far?",
            nextNodeId: "engineer-opinion"
          },
          {
            id: "end-convo",
            text: "I should let you get back to work."
          }
        ]
      },
      {
        id: "engineer-background",
        text: "I grew up on a mining colony in the Antares sector. Not much to do there except learn how machines work or breathe rock dust. I chose the machines. Got my certification at the Alliance Technical Institute and never looked back. Been fixing things that weren't supposed to break for about fifteen years now.",
        speakerId: "engineer",
        type: DialogueType.Lore,
        options: [
          {
            id: "ask-family",
            text: "Do you have family back in the Antares sector?",
            relationshipEffect: 2,
            nextNodeId: "engineer-family"
          },
          {
            id: "ask-expertise-from-background",
            text: "Did your mining colony experience influence your specialty?",
            nextNodeId: "engineer-expertise"
          },
          {
            id: "return-to-intro",
            text: "Interesting background. Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-family",
        text: "Parents are still there, running a supply depot. My sister joined the Alliance Science Division - studying xenobotany on some garden world. We keep in touch when comms allow it. This deep space assignment makes that... challenging.",
        speakerId: "engineer",
        type: DialogueType.Lore,
        options: [
          {
            id: "express-sympathy",
            text: "It must be hard being away from them for so long.",
            relationshipEffect: 3,
            nextNodeId: "engineer-sympathy-response"
          },
          {
            id: "return-to-intro",
            text: "Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-sympathy-response",
        text: "Yeah... it is. But that's the life we choose out here, isn't it? The stars call and we answer. Still, getting a message from home makes even the worst day better. I appreciate you asking, Captain. Not everyone bothers to know the person behind the toolkit.",
        speakerId: "engineer",
        type: DialogueType.Reaction,
        options: [
          {
            id: "return-to-intro",
            text: "A good crew is like family too. Let me ask you something else.",
            relationshipEffect: 2,
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-expertise",
        text: "I'm what they call a systems integration specialist. Propulsion, power distribution, environmental controls - I make sure they all talk to each other properly. But my real passion is upgrading efficiency protocols. I've increased our fuel efficiency by 12% since joining the crew, not that anyone notices until we're the only ship that makes it back to port without refueling.",
        speakerId: "engineer",
        type: DialogueType.Advice,
        options: [
          {
            id: "praise-work",
            text: "That 12% could save our lives someday. Your work is essential.",
            relationshipEffect: 5,
            nextNodeId: "engineer-praise-response"
          },
          {
            id: "suggest-upgrade",
            text: "Any upgrades you'd recommend for our current mission?",
            nextNodeId: "engineer-upgrade-suggestions"
          },
          {
            id: "return-to-intro",
            text: "Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-praise-response",
        text: "Thanks, Captain. That... actually means a lot. Sometimes in engineering, the best work is the disaster that never happens. Nice to have it acknowledged.",
        speakerId: "engineer",
        type: DialogueType.Reaction,
        options: [
          {
            id: "return-to-intro",
            text: "You'll always have my appreciation. Let me ask you something else.",
            relationshipEffect: 1,
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-upgrade-suggestions",
        text: "With what we're facing? I'd prioritize shield harmonics. The radiation in this sector is unlike anything in our databases. I've been working on a modulation sequence that could give us better protection. It's experimental, but the simulations are promising. Would need about six hours in the shield control bay to implement it.",
        speakerId: "engineer",
        type: DialogueType.Advice,
        options: [
          {
            id: "approve-upgrade",
            text: "Make it happen. I'll have someone cover your regular duties.",
            relationshipEffect: 4,
            specialEffects: [
              {
                type: 'unlock',
                value: 'shield-upgrade-mission'
              }
            ],
            nextNodeId: "engineer-approve-response"
          },
          {
            id: "deny-upgrade",
            text: "We can't spare you from regular maintenance right now. Maybe later.",
            relationshipEffect: -2,
            nextNodeId: "engineer-deny-response"
          },
          {
            id: "return-to-intro",
            text: "I'll consider it. Let me ask you something else first.",
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-approve-response",
        text: "I won't let you down, Captain. I'll have those shields upgraded before your next sleep cycle. And... thanks for trusting my judgment on this.",
        speakerId: "engineer",
        type: DialogueType.Reaction,
        options: [
          {
            id: "return-to-intro",
            text: "That's what a good captain does. Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-deny-response",
        text: "Understood, Captain. I'll keep focusing on standard operations. Just... hope we don't regret the delay when we hit the next radiation belt.",
        speakerId: "engineer",
        type: DialogueType.Reaction,
        options: [
          {
            id: "return-to-intro",
            text: "We'll prioritize it when we can. Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-opinion",
        text: "Our mission? Well, from a technical perspective, this ship is being pushed to its limits. The ancient artifacts we're chasing... they give off energy signatures I've never seen before. Sometimes they interfere with our systems in ways I can't explain. Fascinating and terrifying at the same time.",
        speakerId: "engineer",
        type: DialogueType.Lore,
        options: [
          {
            id: "ask-danger",
            text: "Are these artifacts dangerous to the ship?",
            nextNodeId: "engineer-danger-assessment"
          },
          {
            id: "ask-personal-opinion",
            text: "But what do YOU think about searching for the Architects' legacy?",
            relationshipEffect: 3,
            nextNodeId: "engineer-personal-opinion"
          },
          {
            id: "return-to-intro",
            text: "Interesting perspective. Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-danger-assessment",
        text: "Dangerous? Potentially. Each artifact has a unique electromagnetic signature that can disrupt our systems. I've installed isolation protocols, but they're not perfect. The artifact in cargo bay three caused a power surge last week that fried two backup relays. Nothing critical... yet.",
        speakerId: "engineer",
        type: DialogueType.Advice,
        options: [
          {
            id: "ask-recommendations",
            text: "What precautions do you recommend for future artifacts?",
            nextNodeId: "engineer-recommendations"
          },
          {
            id: "return-to-intro",
            text: "I'll keep that in mind. Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-recommendations",
        text: "I've designed a containment field that should help isolate the artifacts' energy signatures. It's not perfect, but it's better than nothing. I've also set up automated diagnostics to alert us to any system anomalies that might be artifact-related. If you approve, I'd like to install additional surge protectors throughout the ship as a precaution.",
        speakerId: "engineer",
        type: DialogueType.Advice,
        options: [
          {
            id: "approve-protectors",
            text: "Do it. Ship safety is paramount.",
            relationshipEffect: 3,
            specialEffects: [
              {
                type: 'unlock',
                value: 'surge-protection-upgrade'
              }
            ],
            nextNodeId: "engineer-approval-response"
          },
          {
            id: "ask-cost",
            text: "What resources would that require?",
            nextNodeId: "engineer-resource-explanation"
          },
          {
            id: "return-to-intro",
            text: "I'll think about it. Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-approval-response",
        text: "Excellent. I'll get right on it. Should have the protectors installed by 0800 tomorrow. The ship will be much safer for it.",
        speakerId: "engineer",
        type: DialogueType.Reaction,
        options: [
          {
            id: "return-to-intro",
            text: "Thank you. Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-resource-explanation",
        text: "We'd need about fifteen power regulators and twenty meters of insulated conduit. We have enough in storage, but it would deplete our reserves by about 30%. It's a trade-off between protection now and flexibility later if something else breaks.",
        speakerId: "engineer",
        type: DialogueType.Advice,
        options: [
          {
            id: "approve-after-explanation",
            text: "Proceed with the installation. Better safe than sorry.",
            relationshipEffect: 2,
            specialEffects: [
              {
                type: 'unlock',
                value: 'surge-protection-upgrade'
              }
            ],
            nextNodeId: "engineer-approval-response"
          },
          {
            id: "deny-after-explanation",
            text: "Let's hold off. I'd rather keep our reserves for emergency repairs.",
            nextNodeId: "engineer-denial-response"
          },
          {
            id: "return-to-intro",
            text: "I need to consider this carefully. Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-denial-response",
        text: "Understood, Captain. I'll keep an eye on the systems and do what I can with manual monitoring. Just be aware that we might not catch all anomalies before they cause damage.",
        speakerId: "engineer",
        type: DialogueType.Reaction,
        options: [
          {
            id: "return-to-intro",
            text: "Noted. Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-personal-opinion",
        text: "Personally? It's the opportunity of a lifetime. The Architects' technology was millennia beyond our own. Every fragment we recover teaches us something new. As an engineer, it's like... like finding instructions left by gods. But I'd be lying if I said it didn't keep me up at night sometimes. There's a reason their civilization disappeared, and we're poking at their remains with a stick.",
        speakerId: "engineer",
        type: DialogueType.Lore,
        options: [
          {
            id: "share-concern",
            text: "I share your concerns. We need to proceed with caution.",
            relationshipEffect: 4,
            nextNodeId: "engineer-shared-concern"
          },
          {
            id: "express-confidence",
            text: "That's why we have brilliant engineers like you to keep us safe.",
            relationshipEffect: 2,
            nextNodeId: "engineer-confidence-response"
          },
          {
            id: "return-to-intro",
            text: "Fascinating perspective. Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-shared-concern",
        text: "Glad to hear you say that, Captain. Some of the science team get so excited about discovery they forget about security protocols. It's refreshing to know you're considering all angles. If you ever want my assessment on an artifact's potential dangers, my door is always open.",
        speakerId: "engineer",
        type: DialogueType.Reaction,
        options: [
          {
            id: "accept-offer",
            text: "I'll definitely take you up on that offer.",
            relationshipEffect: 1,
            specialEffects: [
              {
                type: 'unlock',
                value: 'engineer-artifact-consultation'
              }
            ],
            nextNodeId: "engineer-accept-consultation"
          },
          {
            id: "return-to-intro",
            text: "Thank you. Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-accept-consultation",
        text: "Excellent. I've set up a specialized diagnostic program for artifact analysis. I'll add you to the alert system so you can see my reports directly. Knowledge is our best defense against the unknown.",
        speakerId: "engineer",
        type: DialogueType.Advice,
        options: [
          {
            id: "return-to-intro",
            text: "I appreciate your thoroughness. Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-confidence-response",
        text: "I... well, thank you for the vote of confidence, Captain. I do my best, but these artifacts are beyond anything in our engineering manuals. Each one is a new puzzle. I just hope I'm clever enough to solve them before any serious problems arise.",
        speakerId: "engineer",
        type: DialogueType.Reaction,
        options: [
          {
            id: "return-to-intro",
            text: "I have faith in your abilities. Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      }
    ],
    availability: {
      requiredRelationship: RelationshipLevel.Neutral
    }
  },
  
  // Scientific discovery dialogue tree
  {
    id: "scientist-discovery-discussion",
    title: "Scientific Breakthrough Analysis",
    description: "Discuss a recent scientific discovery with your science officer",
    startNodeId: "scientist-discovery-intro",
    nodes: [
      {
        id: "scientist-discovery-intro",
        text: "Captain! Perfect timing. I've been analyzing the data from our latest planetary scan, and I've found something remarkable. A moment of your time?",
        speakerId: "scientist",
        type: DialogueType.Exploration,
        options: [
          {
            id: "excited-response",
            text: "What have you discovered? This sounds important.",
            relationshipEffect: 2,
            nextNodeId: "scientist-explains-discovery"
          },
          {
            id: "cautious-response",
            text: "Is this related to our mission objectives?",
            nextNodeId: "scientist-relates-to-mission"
          },
          {
            id: "busy-response",
            text: "Can this wait? I'm in the middle of something.",
            relationshipEffect: -2,
            nextNodeId: "scientist-disappointed"
          }
        ]
      },
      {
        id: "scientist-explains-discovery",
        text: "The planet we just scanned shows evidence of artificial structures beneath the surface - structures that match Architect patterns we've seen before. But here's the fascinating part: they appear to be power generation facilities that are still active after thousands of years! The energy readings are faint but unmistakable.",
        speakerId: "scientist",
        type: DialogueType.Exploration,
        options: [
          {
            id: "ask-significance",
            text: "What could this tell us about the Architects' technology?",
            relationshipEffect: 3,
            nextNodeId: "scientist-explains-significance"
          },
          {
            id: "ask-danger",
            text: "Could these active facilities pose any danger?",
            nextNodeId: "scientist-assesses-risk"
          },
          {
            id: "ask-investigation",
            text: "Do you recommend we investigate more closely?",
            nextNodeId: "scientist-recommends-action"
          }
        ]
      },
      {
        id: "scientist-explains-significance",
        text: "This could revolutionize our understanding of sustainable energy! The Architects created power systems that could run autonomously for millennia. The principles behind such technology could solve energy crises across colonized space. From a theoretical perspective, it also suggests they mastered zero-point energy extraction or something equally advanced.",
        speakerId: "scientist",
        type: DialogueType.Lore,
        options: [
          {
            id: "ask-applications",
            text: "Could we adapt this technology for our ship?",
            nextNodeId: "scientist-discusses-applications"
          },
          {
            id: "ask-investigation-after-significance",
            text: "How should we proceed with investigating this site?",
            nextNodeId: "scientist-recommends-action"
          }
        ]
      },
      {
        id: "scientist-discusses-applications",
        text: "Potentially, yes! If we can understand the principles, we might be able to create a scaled-down version. It would require significant research and probably some engineering breakthroughs, but the potential is enormous. Our engineer might have some insights on implementation if we can gather enough data.",
        speakerId: "scientist",
        type: DialogueType.Advice,
        options: [
          {
            id: "approve-research",
            text: "This should be a research priority. Gather what you need.",
            relationshipEffect: 5,
            specialEffects: [
              {
                type: 'unlock',
                value: 'architect-energy-research'
              }
            ],
            nextNodeId: "scientist-excited-approval"
          },
          {
            id: "cautious-approach",
            text: "Let's investigate cautiously. No direct interaction with the technology yet.",
            nextNodeId: "scientist-accepts-caution"
          }
        ]
      },
      {
        id: "scientist-excited-approval",
        text: "Fantastic! I'll prepare a specialized research team immediately. This could be the breakthrough we've been hoping for! With your permission, I'd like to collaborate with the engineering department to set up safe testing protocols.",
        speakerId: "scientist",
        type: DialogueType.Reaction,
        options: [
          {
            id: "approve-collaboration",
            text: "Approved. Keep me updated on your progress.",
            specialEffects: [
              {
                type: 'unlock',
                value: 'cross-department-research'
              }
            ],
            nextNodeId: "scientist-collaboration-thanks"
          },
          {
            id: "end-conversation",
            text: "Get started right away. We'll discuss details later."
          }
        ]
      },
      {
        id: "scientist-collaboration-thanks",
        text: "Thank you, Captain! This is exactly the kind of discovery we hoped to make on this mission. I'll have preliminary findings for you within 48 hours. This is exciting!",
        speakerId: "scientist",
        type: DialogueType.Reaction,
        options: [
          {
            id: "end-conversation",
            text: "I look forward to seeing what you learn."
          }
        ]
      },
      {
        id: "scientist-accepts-caution",
        text: "A prudent approach, Captain. We'll set up remote observation equipment and gather data passively first. It will take longer, but safety protocols are there for good reasons. I'll prepare a detailed scan analysis for your review.",
        speakerId: "scientist",
        type: DialogueType.Reaction,
        options: [
          {
            id: "end-conversation",
            text: "Keep me informed of anything significant you find."
          }
        ]
      },
      {
        id: "scientist-assesses-risk",
        text: "A valid concern. Any technology this powerful comes with risks. The energy signatures don't match anything in our hazard database, but that could mean it's benign or simply unknown to us. There are also unusual radiation patterns that our shields should protect against, but landing parties would need extra precautions.",
        speakerId: "scientist",
        type: DialogueType.Advice,
        options: [
          {
            id: "ask-safety-measures",
            text: "What safety measures would you recommend?",
            nextNodeId: "scientist-suggests-safety"
          },
          {
            id: "delay-investigation",
            text: "Let's hold off on closer investigation until we know more.",
            nextNodeId: "scientist-accepts-delay"
          }
        ]
      },
      {
        id: "scientist-suggests-safety",
        text: "I recommend enhanced radiation shielding for any away team, remote drone exploration of the interior spaces before human entry, and continuous monitoring of energy fluctuations. We should also establish a quarantine protocol for any samples or artifacts we retrieve. With these precautions, I believe we can investigate safely.",
        speakerId: "scientist",
        type: DialogueType.Advice,
        options: [
          {
            id: "approve-with-safety",
            text: "Implement these measures and proceed with the investigation.",
            specialEffects: [
              {
                type: 'unlock',
                value: 'enhanced-safety-protocols'
              }
            ],
            nextNodeId: "scientist-acknowledges-approval"
          },
          {
            id: "request-plan",
            text: "Prepare a detailed mission plan for my review first.",
            nextNodeId: "scientist-prepares-plan"
          }
        ]
      },
      {
        id: "scientist-acknowledges-approval",
        text: "Excellent! I'll coordinate with security to implement these protocols immediately. We should be ready for preliminary investigation within a few hours. This is a tremendous opportunity, Captain. Thank you for your support.",
        speakerId: "scientist",
        type: DialogueType.Reaction,
        options: [
          {
            id: "end-conversation",
            text: "Proceed carefully. I want discoveries, not casualties."
          }
        ]
      },
      {
        id: "scientist-prepares-plan",
        text: "Of course, Captain. I'll have a comprehensive mission plan prepared for your review within the hour. It will include risk assessments, resource requirements, and expected outcomes. We'll proceed only when you're satisfied with all safety considerations.",
        speakerId: "scientist",
        type: DialogueType.Reaction,
        options: [
          {
            id: "end-conversation",
            text: "I'll review it as soon as it's ready."
          }
        ]
      },
      {
        id: "scientist-accepts-delay",
        text: "I understand your caution, Captain. We'll continue passive observation and data collection from orbit. It's less informative than direct investigation, but still valuable. I'll update you if we detect any changes or additional information that might affect your decision.",
        speakerId: "scientist",
        type: DialogueType.Reaction,
        options: [
          {
            id: "end-conversation",
            text: "Thank you for understanding. Safety must come first."
          }
        ]
      },
      {
        id: "scientist-recommends-action",
        text: "Absolutely! An opportunity like this is rare. I recommend a two-phase approach: first, detailed orbital scans to map the facility completely, then a small expedition to the surface with specialized equipment. We should prioritize this investigation - the potential scientific value is enormous.",
        speakerId: "scientist",
        type: DialogueType.Advice,
        options: [
          {
            id: "approve-expedition",
            text: "Prepare your expedition. This is now a priority mission.",
            relationshipEffect: 4,
            specialEffects: [
              {
                type: 'unlock',
                value: 'architect-site-expedition'
              }
            ],
            nextNodeId: "scientist-expedition-approval"
          },
          {
            id: "approve-scans-only",
            text: "Let's start with the orbital scans and evaluate from there.",
            nextNodeId: "scientist-accepts-partial"
          },
          {
            id: "delay-for-mission",
            text: "This is interesting, but we need to stay focused on our primary mission.",
            relationshipEffect: -3,
            nextNodeId: "scientist-disappointed-priority"
          }
        ]
      },
      {
        id: "scientist-expedition-approval",
        text: "Wonderful! I'll assemble my team immediately. This could be the most significant find of our entire mission! I'll need a security detail and some specialized equipment from engineering, but we can be ready to deploy within 12 hours. Thank you for recognizing the importance of this discovery, Captain.",
        speakerId: "scientist",
        type: DialogueType.Reaction,
        options: [
          {
            id: "end-conversation",
            text: "Keep me updated on your preparations and findings."
          }
        ]
      },
      {
        id: "scientist-accepts-partial",
        text: "A measured approach, Captain. We'll begin comprehensive orbital scans immediately. I should have preliminary data within a few hours, and complete mapping within a day. I'll prepare a detailed report for your review, which should help us determine if a surface expedition is warranted.",
        speakerId: "scientist",
        type: DialogueType.Reaction,
        options: [
          {
            id: "end-conversation",
            text: "I look forward to seeing the scan results."
          }
        ]
      },
      {
        id: "scientist-disappointed-priority",
        text: "I... understand, Captain. Though I must emphasize that this discovery could be directly relevant to our mission objectives regarding Architect technology. We'll continue minimal observation while focusing on our primary objectives. If you reconsider, the opportunity may still be available for a limited time.",
        speakerId: "scientist",
        type: DialogueType.Reaction,
        options: [
          {
            id: "reconsider",
            text: "You make a good point. Go ahead with the orbital scans at least.",
            relationshipEffect: 1,
            nextNodeId: "scientist-grateful-reconsideration"
          },
          {
            id: "end-conversation",
            text: "Noted. We'll revisit this if our schedule permits."
          }
        ]
      },
      {
        id: "scientist-grateful-reconsideration",
        text: "Thank you, Captain! I appreciate your reconsideration. We'll proceed with the orbital scans immediately while maintaining our other mission priorities. I'm confident the data will prove valuable to our overall objectives.",
        speakerId: "scientist",
        type: DialogueType.Reaction,
        options: [
          {
            id: "end-conversation",
            text: "Just make sure it doesn't interfere with our primary mission."
          }
        ]
      },
      {
        id: "scientist-relates-to-mission",
        text: "It's directly related, Captain. These energy signatures match patterns mentioned in the Architect codex we recovered last month. This could be one of the power sources referenced in those fragments - a critical piece of the puzzle we're trying to solve about their civilization and technology.",
        speakerId: "scientist",
        type: DialogueType.Lore,
        options: [
          {
            id: "interested-after-relevance",
            text: "In that case, tell me more about this discovery.",
            nextNodeId: "scientist-explains-discovery"
          },
          {
            id: "still-cautious",
            text: "How certain are you of this connection?",
            nextNodeId: "scientist-explains-evidence"
          }
        ]
      },
      {
        id: "scientist-explains-evidence",
        text: "The correlation is approximately 92% certain based on pattern matching algorithms. The energy wavelength frequencies, the structural geometry visible in our scans, and the material composition all align with Architect signatures we've cataloged. While not absolute proof, the statistical probability is compelling enough to warrant investigation.",
        speakerId: "scientist",
        type: DialogueType.Lore,
        options: [
          {
            id: "convinced-by-evidence",
            text: "That's convincing evidence. Tell me more about the discovery itself.",
            nextNodeId: "scientist-explains-discovery"
          },
          {
            id: "ask-investigation-evidence",
            text: "What specifically do you want to investigate?",
            nextNodeId: "scientist-recommends-action"
          }
        ]
      },
      {
        id: "scientist-disappointed",
        text: "Oh... of course, Captain. I understand you have many responsibilities. It's just... well, discoveries like this are why many of us joined this mission. The data will be in my report whenever you have time to review it.",
        speakerId: "scientist",
        type: DialogueType.Reaction,
        options: [
          {
            id: "reconsider-after-guilt",
            text: "Actually, this sounds important. Tell me what you've found.",
            relationshipEffect: 1,
            nextNodeId: "scientist-explains-discovery"
          },
          {
            id: "remain-busy",
            text: "I'll review your report later. Thank you for understanding.",
            nextNodeId: "scientist-formal-acknowledgment"
          }
        ]
      },
      {
        id: "scientist-formal-acknowledgment",
        text: "Yes, Captain. The report will be in your queue. With your permission, I'll continue preliminary analysis while waiting for your decision on further investigation.",
        speakerId: "scientist",
        type: DialogueType.Reaction,
        options: [
          {
            id: "approve-preliminary",
            text: "Yes, continue your analysis. We'll discuss it further soon.",
            nextNodeId: "scientist-professional-thanks"
          },
          {
            id: "end-conversation",
            text: "Carry on with your regular duties for now."
          }
        ]
      },
      {
        id: "scientist-professional-thanks",
        text: "Thank you, Captain. I'll make sure my analysis is thorough and ready for your review. I believe you'll find the results quite significant.",
        speakerId: "scientist",
        type: DialogueType.Reaction,
        options: [
          {
            id: "end-conversation",
            text: "I look forward to it."
          }
        ]
      }
    ],
    availability: {
      requiredRelationship: RelationshipLevel.Neutral,
      requiredPersonality: CompanionPersonality.Scientific
    }
  }
];

// Helper function to find a dialogue tree by ID
export function findDialogueTree(id: string): DialogueTree | undefined {
  return crewDialogueTrees.find(tree => tree.id === id);
}

// Helper function to find a node within a dialogue tree
export function findDialogueNode(tree: DialogueTree, nodeId: string): DialogueNode | undefined {
  return tree.nodes.find(node => node.id === nodeId);
}

// Helper function to get available dialogue trees for a specific crew member
export function getAvailableDialogueTrees(
  crewMemberId: string, 
  personality: CompanionPersonality,
  relationshipLevel: RelationshipLevel,
  gameProgress: number = 0,
  currentLocation?: string
): DialogueTree[] {
  return crewDialogueTrees.filter(tree => {
    // Check if this tree is available based on requirements
    const availability = tree.availability;
    
    // Check relationship requirement
    if (availability.requiredRelationship) {
      const relationshipOrder = Object.values(RelationshipLevel);
      const requiredIndex = relationshipOrder.indexOf(availability.requiredRelationship);
      const currentIndex = relationshipOrder.indexOf(relationshipLevel);
      
      if (currentIndex < requiredIndex) return false;
    }
    
    // Check personality requirement
    if (availability.requiredPersonality && availability.requiredPersonality !== personality) {
      return false;
    }
    
    // Check progress requirement
    if (availability.requiredProgress && gameProgress < availability.requiredProgress) {
      return false;
    }
    
    // Check location requirement
    if (availability.requiredLocation && availability.requiredLocation !== currentLocation) {
      return false;
    }
    
    // All checks passed
    return true;
  });
}