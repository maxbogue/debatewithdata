export const Flag = {
  AD_HOMINEM: 'ad-hominem',
  AUTHORITY: 'authority',
  BANDWAGON: 'bandwagon',
  EMOTION: 'emotion',
  FALSE_CAUSE: 'false-cause',
  FALSE_DILEMMA: 'false-dilemma',
  MIDDLE_GROUND: 'middle-ground',
  NATURE: 'nature',
  SLIPPERY_SLOPE: 'slippery-slope',
  STRAWMAN: 'strawman',
};

export const FlagData = {
  [Flag.AD_HOMINEM]: {
    name: 'Ad Hominem',
    links: [
      ['Wikipedia', 'https://en.wikipedia.org/wiki/Ad_hominem'],
      ['YLFI', 'https://yourlogicalfallacyis.com/ad-hominem'],
    ],
    tldr: 'Attacks a person instead of their argument.',
    desc: `An ad hominem argument attacks personal traits of someone making an
argument to undermine them instead of actually countering their argument.
<br /><br />
It is a fallacy because the validity of an argument is independent
of the person presenting it.`,
  },
  [Flag.AUTHORITY]: {
    name: 'Appeal to Authority',
    links: [
      ['Wikipedia', 'https://en.wikipedia.org/wiki/Argument_from_authority'],
      ['YLFI', 'https://yourlogicalfallacyis.com/appeal-to-authority'],
    ],
    tldr: 'Appeals to the opinion of an authority figure.',
    desc: `Appeals to authority try to validate a claim by referencing people
who agree with it. Regardless of whether the people are knowledgable on the
topic or not, opinions are not data.`,
  },
  [Flag.BANDWAGON]: {
    name: 'Bandwagon',
    links: [
      ['Wikipedia', 'https://en.wikipedia.org/wiki/Argumentum_ad_populum'],
      ['YLFI', 'https://yourlogicalfallacyis.com/bandwagon'],
    ],
    tldr: 'Appeals to the number of people that agree.',
    desc: `Bandwagon arguments try to validate a claim based on the number of
people who agree with it. This is fallacious because the number of people that
believe something has no bearing on whether it is true.`,
  },
  [Flag.EMOTION]: {
    name: 'Appeal to Emotion',
    links: [
      ['Wikipedia', 'https://en.wikipedia.org/wiki/Appeal_to_emotion'],
      ['YLFI', 'https://yourlogicalfallacyis.com/appeal-to-emotion'],
    ],
    tldr: 'Manipulates emotions instead of presenting evidence.',
    desc: `Appeals to emotion deliberately manipulate the emotions of the
reader without presenting any actual evidence. This is fallacious because how
an argument makes you feel is irrelevant if the argument itself is not based on
reality.`, },
  [Flag.FALSE_CAUSE]: {
    name: 'False Cause',
    links: [
      ['Wikipedia', 'https://en.wikipedia.org/wiki/Correlation_does_not_\
imply_causation'],
      ['YLFI', 'https://yourlogicalfallacyis.com/false-cause'],
    ],
    tldr: 'Assumes correlation equals causation.',
    desc: `False cause arguments assume that correlation between two things
implies a causal relationship without explaining the causation. This is
fallacious because many things can look or be made to look correlated that are
actually completely unrelated.`,
  },
  [Flag.FALSE_DILEMMA]: {
    name: 'False Dilemma',
    links: [
      ['Wikipedia', 'https://en.wikipedia.org/wiki/False_dilemma'],
      ['YLFI', 'https://yourlogicalfallacyis.com/black-or-white'],
    ],
    tldr: 'Assumes there are only two possibilities.',
    desc: `False dilemma arguments assume there are only two possibilities when
in reality there are more options. Often the two possibilities presented are
the extreme ends of a continuous spectrum.`,
  },
  [Flag.MIDDLE_GROUND]: {
    name: 'Middle Ground',
    links: [
      ['Wikipedia', 'https://en.wikipedia.org/wiki/Argument_to_moderation'],
      ['YLFI', 'https://yourlogicalfallacyis.com/middle-ground'],
    ],
    tldr: 'Assumes the truth must lie somewhere between two extremes.',
    desc: `Middle ground arguments assume that the truth must be somewhere in
the middle of two extremes. They are the opposite of false dilemma arguments.
Just because two things are extremes doesn't mean one isn't true, and
compromising between them may produce something still false.`,
  },
  [Flag.NATURE]: {
    name: 'Appeal to Nature',
    links: [
      ['Wikipedia', 'https://en.wikipedia.org/wiki/Appeal_to_nature'],
      ['YLFI', 'https://yourlogicalfallacyis.com/appeal-to-nature'],
    ],
    tldr: 'Assumes that something is right because it is natural.',
    desc: `Appeals to nature try to strenthen a claim by associating it with
being "natural". This is a fallacy both because what is considered natural is
highly subjective and because natural things are not always good.`,
  },
  [Flag.SLIPPERY_SLOPE]: {
    name: 'Slippery Slope',
    links: [
      ['Wikipedia', 'https://en.wikipedia.org/wiki/Slippery_slope'],
      ['YLFI', 'https://yourlogicalfallacyis.com/slippery-slope'],
    ],
    tldr: 'Assumes that a small effect will lead to a bigger one.',
    desc: `Slippery slope arguments assume that if one thing happens, another
worse thing will follow. This is a fallacy if there's no reason presented to
justify why the worse thing will follow.`,
  },
  [Flag.STRAWMAN]: {
    name: 'Strawman',
    links: [
      ['Wikipedia', 'https://en.wikipedia.org/wiki/Straw_man'],
      ['YLFI', 'https://yourlogicalfallacyis.com/strawman'],
    ],
    tldr: 'Refutes an argument that wasn\'t made.',
    desc: `Strawman arguments generate a fake argument by the opposition
so they can defeat it. They are more common in live discussions.`,
  },
};
