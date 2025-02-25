# 2025-group-2
2025 COMSM0166 group 2

## Links to weekly discussions

| Week Number | Links | 
|:----:|:-----:| 
| Week 1 | [meeting minutes](/ReportMaterial/MeetingMinutes/16Jan2025.txt) <br> [Kanban link](https://github.com/orgs/UoB-COMSM0166/projects/73/views/13)|
| Week 2 | [meeting minutes](/ReportMaterial/MeetingMinutes/21Jan2025.txt) <br> [Kanban link](https://github.com/orgs/UoB-COMSM0166/projects/73/views/12) |
| Week 3 | [meeting minutes](/ReportMaterial/MeetingMinutes/28Jan2025.txt) <br> [merge fruit discussion drawings](/ReportMaterial/MeetingMinutes/28th.jpeg) <br> [merge fruit initial brainstorm](/ReportMaterial/ProgressTracker/merge-fruit-brainstorming-28Jan2025.pdf) <br> [flappy bird gameplay video for lab](/ReportMaterial/Week3PrototypeVideos/flappy-bird-ppt-gameplay.mp4) <br> [merge fruit gameplay video for lab](https://www.youtube.com/shorts/hrKJQ_CAGm4) <br> [Kanban link](https://github.com/orgs/UoB-COMSM0166/projects/73/views/14) |
| Week 4 | [meeting minutes](/ReportMaterial/MeetingMinutes/4thFeb2025.txt) <br> [merge fruit new brainstorm redrawn](/ReportMaterial/ProgressTracker/merge-fruit-redo-4Feb2025.pdf) <br> [merge fruit new discussion drawings](/ReportMaterial/ProgressTracker/Meeting%20pic%20on%204th%20Feb.jpeg) <br> [game requirements week4 lab](/ReportMaterial/Week4LabGameRequriments/week4-game-requirements.txt) <br> [Kanban link](https://github.com/orgs/UoB-COMSM0166/projects/73/views/15) |
| Week 5 | [meeting minutes](ReportMaterial/MeetingMinutes/11thFeb2025.txt) <br> [Kanban link](https://github.com/orgs/UoB-COMSM0166/projects/73/views/16) <br> [Class Diagram](/ReportMaterial/Diagrams/class-diagram-v1.jpeg) |
| Week 7 | [meeting minutes 1](ReportMaterial/MeetingMinutes/24Feb2025.txt) <br> [meeting minutes 2](ReportMaterial/MeetingMinutes/25Feb2025.txt) <br> [Kanban link](https://github.com/orgs/UoB-COMSM0166/projects/73/views/17) |

## Your Game

Link to your game [PLAY HERE](https://uob-comsm0166.github.io/2025-group-2/)

Your game lives in the [/docs](/docs) folder, and is published using Github pages to the link above.

Include a demo video of your game here (you don't have to wait until the end, you can insert a work in progress video)

## Your Group

<img src='/images/group_photo.jpg'/>

| Name | Email |  
|:----:|:-----:|
| Hayley Yi Li Tay | zo24201@bristol.ac.uk |
| Doris Chia Chia Wu | nq24705@bristol.ac.uk |
| Shiyu Fan | hp24308@bristol.ac.uk |
| Jimmy Chih Chun Lin | jp24407@bristol.ac.uk |
| Octave Jin Liao | ge24446@bristol.ac.uk |
| Gerald Rodrigue | nu24692@bristol.ac.uk |


## Project Report

### Introduction

- 5% ~250 words 
- Describe your game, what is based on, what makes it novel? 

### Requirements 

- 15% ~750 words
- Use case diagrams, user stories. Early stages design. Ideation process. How did you decide as a team what to develop? 

As a team, we discovered that assigning epics to our stakeholders significantly enhanced our ability to plan the next steps. For example, epics allowed us to define user stories and acceptance criteria in advance, enabling a deeper understanding of the features we needed to develop, such as the story of a user wanting to utilize a new game feature. This allows us to list out in more details all the requirements in the development of the game and note down ideas from different stakeholders' perspectives which we may or may not have missed out on if we were to approach this without using the method taught to us. 

Furthermore, by having a clear understanding of the tasks at hand, we were able to create a detailed list of the necessary actions to implement changes and meet our stakeholders' needs, such as the specific tasks required to develop the new game feature. This gives our planning a more structured approach and we're thus less likely to make potentially fatal mistakes. 

In conclusion, the requirements gathering process provided us with valuable insights on how to organize and prioritize activities to successfully fulfill the project requirements.

### Design

- 15% ~750 words 
- System architecture. Class diagrams, behavioural diagrams. 

### Implementation

- 15% ~750 words

- Describe implementation of your game, in particular highlighting the three areas of challenge in developing your game. 

### Evaluation

- 15% ~750 words

<ins> Qualitative Evaluation </ins>  
The qualitative evaluations were collected in two stages: 
- Stage 1 - the initial demo version
- Stage 2- the improved version with modifications to address the feedbacks given during Stage 1

Evaluations collected at each stage allowed the team to gain a clearer understanding of player needs and expectations, allowing for improvements in the right direction before arriving at the final version that is enjoyable to the players of the game. Problems spotted by players during the different stages were addressed early which helped avoid unnecessary complications, and negative feedbacks drove improvement to overall gameplay experience.

<br>

 *Stage 1 - Initial Demo Version (25th Feb 2025)*
> Think Aloud Evaluation  
>> Positives Experiences: 
>>> * Shake Tool is a good function that adds to the playability of the game
>>> * The twist of having at least 5 different functions/tools made the game more fun and addicting
>>> * The eye movement on the balls is interesting
>>  
>> Problems spotted: 
>>> * Rainbow function stops working intermittently
>>> * Bomb function does not cause explosion but merges normally instead
>>  
>> Feedbacks for Improvement: 
>>>* Container (playing field) needs to be bigger
>>> * Description of all function/tools should be added
>>> * Will be good to show a list of all different sizes of balls

> Heuristic Evaluation: 
>> | Interface | Issue | Heuristic | Frequency | Impact | Persistence | Severity |
>>|---------- |------- | --------- | --------------- | ------------ | ----------------- | -------------------- |
>>| Single Player Main Game | End game criteria needs to be added as the game is just an infinite loop right now with no ending | Visibility of System Status | 4 | 4 | 4 | 4 |
>>| Single Player Main Game | There are no descriptions of the available tools in the game, only a button with the tool names. Players don't know what they are for | Help and documentation | 4 | 2 | 2 | 2.6 |
>>| Single Player Main Game | Players can't tell when the wind incidence is activated as there are no animations or indications, making it feel abrupt | Visibility of System Status | 3 | 3 | 2 | 2.6 |
>>| Single Player Main Game | Some functions like the Bomb tool does not work as expected (no explosions even though the name would imply an explosion) | Match between System and the Real World | 4 | 2 | 2 | 2.6 |
>>| Single Player Main Game | Scores of the game needs to be more obvious | Visibility of System Status | 2 | 1 | 1 | 1.3 |

<br>

Consolidating the feedbacks received from Stage 1 of our qualitative evaluation, we identified the following points for prioritisation:

* Players need a way to determine that the game has ended
* Tools not working as intended
* Description of tools need to be displayed
* More animations need to be included so it is obvious to players when an in-game event occurs

The points above are marked for prioritisation and as areas to focus on because they were either pointed out multiple times or that their negative impact on the game was huge. 
A key issue that was given a score of 4 for severity was that there was no end to the game. This was a point that was noted down as the top priority for rectification.

Once we had the evaluations analysed for Stage 1, the next steps and development prioritisations became clearer. The first improvement to be pushed was to include a way for the players to determine when their game has ended, essentially breaking out of the infinite loop and attaching a goal to the game. A couple of tools that did not work as intended also had to be fixed so that the gameplay does not get negatively impacted. We also had to improve player experience by adding descriptions to the tools available in the game and additional animations for in-game event occurences. While the overall experience was positive, these were glaring issues that required our immediate attention before moving onto Stage 2. 





- One quantitative evaluation (of your choice) 

- Description of how code was tested. 

### Process 

- 15% ~750 words

- Teamwork. How did you work together, what tools did you use. Did you have team roles? Reflection on how you worked together. 

### Conclusion

- 10% ~500 words

- Reflect on project as a whole. Lessons learned. Reflect on challenges. Future work. 

### Contribution Statement

- Provide a table of everyone's contribution, which may be used to weight individual grades. We expect that the contribution will be split evenly across team-members in most cases. Let us know as soon as possible if there are any issues with teamwork as soon as they are apparent. 

### Additional Marks

You can delete this section in your own repo, it's just here for information. in addition to the marks above, we will be marking you on the following two points:

- **Quality** of report writing, presentation, use of figures and visual material (5%) 
  - Please write in a clear concise manner suitable for an interested layperson. Write as if this repo was publicly available.

- **Documentation** of code (5%)

  - Is your repo clearly organised? 
  - Is code well commented throughout?
