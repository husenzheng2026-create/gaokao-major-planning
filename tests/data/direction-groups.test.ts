import { directionGroups } from '@/data/direction-groups';

describe('directionGroups', () => {
  it('contains 10 top-level direction groups', () => {
    expect(directionGroups).toHaveLength(10);
  });

  it('includes AI and automation in visible labels', () => {
    expect(
      directionGroups.find((group) => group.id === 'cs-ai')?.tags
    ).toContain('人工智能');
    expect(
      directionGroups.find((group) => group.id === 'engineering-auto')?.tags
    ).toContain('机器人工程');
  });
});
