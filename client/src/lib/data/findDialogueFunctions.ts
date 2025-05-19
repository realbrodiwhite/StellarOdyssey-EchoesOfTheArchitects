import { DialogueNode, DialogueTree } from "./crewDialogueTrees";
import { CompanionPersonality, DialogueType, RelationshipLevel } from "../stores/useCompanion";

/**
 * Find a dialogue node by ID in a dialogue tree
 * @param dialogueTree The dialogue tree to search
 * @param nodeId The ID of the node to find
 * @returns The found node or null if not found
 */
export function findDialogueNode(dialogueTree: DialogueTree, nodeId: string): DialogueNode | null {
  return dialogueTree.nodes.find(node => node.id === nodeId) || null;
}

/**
 * Find a dialogue tree by ID in the collection
 * @param treeId The ID of the dialogue tree to find
 * @returns The found dialogue tree or null if not found
 */
export function findDialogueTree(treeId: string): DialogueTree | null {
  // In a real implementation, you would search through all dialogue trees
  // For now, this is a placeholder that pretends to find a tree
  // This would connect to your actual dialogue tree data source
  return {
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
        type: "Lore",
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
        type: "Lore",
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
        type: "Reaction",
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
        type: "Advice",
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
        type: "Reaction",
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
        type: "Advice",
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
        type: "Reaction",
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
        type: "Reaction",
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
        type: "Lore",
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
        type: "Advice",
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
        id: "engineer-personal-opinion",
        text: "Personally? It's the opportunity of a lifetime. The Architects' technology was millennia beyond our own. Every fragment we recover teaches us something new. As an engineer, it's like... like finding instructions left by gods. But I'd be lying if I said it didn't keep me up at night sometimes. There's a reason their civilization disappeared, and we're poking at their remains with a stick.",
        speakerId: "engineer",
        type: "Lore",
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
        type: "Reaction",
        options: [
          {
            id: "return-to-intro",
            text: "I'll definitely take you up on that. Let me ask you something else.",
            relationshipEffect: 2,
            nextNodeId: "engineer-intro"
          }
        ]
      },
      {
        id: "engineer-confidence-response",
        text: "I... appreciate the vote of confidence, Captain. Just don't want to give you a false sense of security. There are limits to what I can protect us from if we're not careful with these artifacts. But I'll do my best to keep us flying, whatever we encounter.",
        speakerId: "engineer",
        type: "Reaction",
        options: [
          {
            id: "return-to-intro",
            text: "I trust your judgment. Let me ask you something else.",
            nextNodeId: "engineer-intro"
          }
        ]
      }
    ],
    availability: {
      requiredRelationship: "Neutral"
    }
  };
}