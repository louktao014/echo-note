import { Injectable, signal } from '@angular/core';

export interface MoM {
  summary: string[];
  resolutions: string[];
  actionItems: { task: string; owner: string; deadline: string }[];
  others: string[];
}

@Injectable({
  providedIn: 'root',
})
export class MeetingDataService {
  private mockTranscript = signal<string>(
    'Alice: Good morning, everyone. Let\'s start the project status update meeting. Bob, can you give us an update on the backend development?\nBob: Sure, Alice. The new microservice is deployed and running. We still need to work on the API documentation. I\'ll get that done by the end of the week.\nCharlie: I have a question. Will the new service be backward compatible?\nBob: That\'s a good question, Charlie. We should add that to the discussion points for the next meeting. For now, let\'s assume it is not.\nAlice: Okay, thanks Bob. I\'ll add that to the action items. Anything else from the backend team?\n(silence)\nAlice: Alright, let\'s move on to the frontend. Carol, how are things looking on your end?\nCarol: We\'re making good progress. The new component library is integrated, and we\'re on track to finish the UI by the end of the sprint.\nAlice: Excellent. Any blockers or issues?\nCarol: None so far. The collaboration with the design team has been great.\nAlice: Perfect. Let\'s wrap this up. I\'ll send out the minutes of the meeting later today. Thanks, everyone.'
  );

  private mockMoM = signal<MoM>({
    summary: [
      'The backend team has deployed the new microservice.',
      'The frontend team is on track to finish the UI by the end of the sprint.',
    ],
    resolutions: [],
    actionItems: [
      {
        task: 'Complete API documentation for the new microservice.',
        owner: 'Bob',
        deadline: 'End of the week',
      },
      {
        task: 'Discuss backward compatibility of the new microservice in the next meeting.',
        owner: 'All',
        deadline: 'Next meeting',
      },
    ],
    others: [
      'The new component library has been successfully integrated by the frontend team.',
    ],
  });

  getTranscript() {
    return this.mockTranscript;
  }

  getMoM() {
    return this.mockMoM;
  }
}
