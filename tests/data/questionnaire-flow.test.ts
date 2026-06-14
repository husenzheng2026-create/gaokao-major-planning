import {
  buildQuestionnaireFlow,
  dynamicQuestionIds,
  fixedCoreQuestionIds
} from '@/data/questionnaire';

describe('buildQuestionnaireFlow', () => {
  it('keeps the fixed core block first and includes every dynamic field exactly once', () => {
    const flow = buildQuestionnaireFlow({ seed: 7 });

    expect(flow.slice(0, fixedCoreQuestionIds.length).map((item) => item.id)).toEqual(
      fixedCoreQuestionIds
    );
    expect(flow.slice(fixedCoreQuestionIds.length).map((item) => item.id).sort()).toEqual(
      [...dynamicQuestionIds].sort()
    );
  });

  it('prioritizes family-risk questions earlier when self and parent directions diverge', () => {
    const flow = buildQuestionnaireFlow({
      seed: 3,
      answers: {
        selfPreferredDirections: ['计算机、数据与人工智能类'],
        parentPreferredDirections: ['教育与师范类']
      }
    });

    const dynamicIds = flow.slice(fixedCoreQuestionIds.length).map((item) => item.id);

    expect(dynamicIds.indexOf('parentRejectedRisks')).toBeLessThan(
      dynamicIds.indexOf('learningStyle')
    );
  });

  it('asks training-cycle questions earlier for long-cycle directions', () => {
    const flow = buildQuestionnaireFlow({
      seed: 2,
      answers: {
        selectedDirections: ['医学与健康服务类', '基础学科与科研潜力类']
      }
    });

    const dynamicIds = flow.slice(fixedCoreQuestionIds.length).map((item) => item.id);

    expect(dynamicIds.indexOf('trainingCycleAcceptance')).toBeLessThan(
      dynamicIds.indexOf('unwantedWorkStyles')
    );
  });

  it('changes question phrasing across different seeds', () => {
    const seedOne = buildQuestionnaireFlow({ seed: 1 });
    const seedTwo = buildQuestionnaireFlow({ seed: 11 });

    const futurePathOne = seedOne.find((item) => item.id === 'futurePath');
    const futurePathTwo = seedTwo.find((item) => item.id === 'futurePath');

    expect(futurePathOne?.title).not.toEqual(futurePathTwo?.title);
  });
});
