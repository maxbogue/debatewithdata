<template>
<div class="narrow">
  <h1>Guide</h1>
  <p>
    The goal of DebateWithData is to create a reference for the debates that
    people have. Debates are represented by <strong>claims</strong>, which have
    <strong>points</strong> for and against them. <strong>Sources</strong> are
    linked to by points to tie data into an argument.
  </p>

  <h2>Alpha</h2>
  <p>
    Please keep in mind that this site is in an <strong>early alpha</strong>
    phase. The two biggest things I need from alpha users are
    <strong>feedback</strong> on any aspect of the site (looks, behavior, data
    structure, etc) and <strong>content</strong> to help me explore how things
    can be improved.
  </p>
  <p>
    Please add and edit content on any topic you'd like, and email
    <a href="mailto:feedback@debatewithdata.org"
       target="_blank">feedback@debatewithdata.org</a> with any feedback that
    occurs to you. Things will undoubtedly break in various fun ways; please
    email <a href="mailto:bugs@debatewithdata.org"
             target="_blank">bugs@debatewithdata.org</a> if something seems
    broken. Also feel free to ping me directly with bugs or feedback if you
    know me and find that preferable.
  </p>

  <h2>Sources<a href="#sources"></a></h2>
  <p>
    A source here is a source of <em>data</em>. It consists of a URL and a
    short description of the data that URL provides, as well as other optional
    metadata. The closer to the origin of the data, the better a source is.
    Primary sources like research papers or firsthand news articles are best.
  </p>

  <h2>Claims<a href="#claims"></a></h2>
  <p>
    In the real world, debates are often very broad in scope, which leads to a
    lot of confusion about exactly what positions each side is defending. To
    keep things cleaner here, debates are distilled down into one or more
    claims. A claim is a clear, simple statement about the world. It is
    defended by points for it, and attacked by points against it.
  </p>

  <h2>Points<a href="#points"></a></h2>
  <p>
    A point for or against a claim is either a link to another claim or a link
    to a source. If a claim is the "what", its points are the "why" or "why
    not".
  </p>

  <h2>Logical Fallacies<a href="#fallacies"></a></h2>
  <p>
    It is very common in debates (especially verbal ones) for people to use
    arguments that contain well-known logical fallacies. They may look or feel
    relevant, but on closer inspection there is no logical connection between
    what they say and the correctness of the topic being discussed. This
    project allows users to flag these logic errors and display a warning about
    them. The supported fallacies are listed below.
  </p>

  <div v-for="[flag, data] in flags" :key="flag">
    <h3 :id="flag">
      <span>{{ data.name }}</span>
      <a :href="'#' + flag"
         :class="$style.anchor"
         class="fas fa-link"></a>
    </h3>
    <p :class="$style.links">
      <a v-for="[title, url] in data.links"
         :key="title"
         :href="url"
         target="_blank">{{ title }}</a>
    </p>
    <p v-html="data.desc"></p>
  </div>
</div>
</template>

<script>
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

import { FlagData } from '../../common/flag';

export default {
  computed: {
    flags: function () {
      let flagList = map(FlagData, (v, k) => [k, v]);
      return sortBy(flagList, ([, v]) => v.name);
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.anchor {
  visibility: hidden;
  color: $text-light-accent;
  font-size: 0.75em;

  &:hover {
    color: $text-dark;
    text-decoration: none;
  }
}

h3:hover .anchor {
  visibility: visible;
}

.links {
  margin: 0;
  font-size: 0.75em;
  font-weight: 400;

  > :not(:first-child)::before {
    content: ' | ';
  }
}
</style>
