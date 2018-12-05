<template>
  <div class="narrow" :class="$style.guide">
    <h1>Guide</h1>
    <p>
      The goal of DebateWithData is to create a crowd-sourced reference for the
      debates that people have. Debates are represented by
      <strong>claims</strong>, which have points for and against them. Points
      are links to either other claims or to <strong>data</strong> objects,
      which represent specific data from a source.
      <strong>Topics</strong> facilitate discovery of the key claims for an area
      of debate.
    </p>
    <p>
      Please explore, add and edit content, and email
      <a
        href="mailto:feedback@debatewithdata.org"
        target="_blank"
        rel="noopener"
        >feedback@debatewithdata.org</a
      >
      with any feedback, bugs, features requests, or other suggestions that you
      have.
    </p>

    <h2>Claims <dwd-anchor name="claims" /></h2>
    <h4>Claims are simple statements about the world.</h4>
    <p>
      In the real world, debates are often very broad in scope, which leads to a
      lot of confusion about exactly what positions each side is defending. To
      keep things cleaner here, debates are distilled down into one or more
      claims. A claim is a clear, simple statement about the world. It is
      defended by points for it, and attacked by points against it.
    </p>
    <p>
      A point for or against a claim is either a link to another claim or a link
      to a data object. If a claim is the "what", its points are the "why" or
      "why not".
    </p>

    <h3>Data Analysis</h3>
    <p>
      Claims display an analysis of the data that supports them in their bottom
      left corner. This analysis is currently extremely simple and only displays
      three states by default:
    </p>

    <ul>
      <li>
        <strong>Needs Data</strong> - Displayed when no data objects exist on
        the "for" side of the claim.
      </li>
      <li>
        <strong>Has Data</strong> - Displayed when a data object exists as a
        direct child on the "for" side of the claim.
      </li>
      <li>
        <strong>Has Data (nested)</strong> - Displayed when a data object exists
        as an indirect child on the "for" side of the claim.
      </li>
    </ul>
    <p>
      Additionally, the analysis may be overriden manually when editing a claim:
    </p>

    <ul>
      <li>
        <strong>Needs Data (forced)</strong> - Should be used when the claim
        needs additional data to be compelling.
      </li>
      <li>
        <strong>Self-Evident</strong> - Should be used when it wouldn't make
        sense for a claim to have data.
      </li>
    </ul>

    <h3>Guidelines</h3>
    <ol>
      <li>
        Claims should be a <strong>single</strong> statement about the world.
      </li>
      <li>Claims should be a statement, not a question.</li>
    </ol>

    <h2>Data <dwd-anchor name="data" /></h2>
    <h4>Data are external sources of information used to support claims.</h4>
    <p>
      A data object consists of a link to the source, a short description of the
      data that source provides, and other optional metadata. The closer to the
      origin of the data the source is, the better. Data objects can also
      contain a table of raw data and generate basic graphs from that data.
      Different types of data can have different metadata fields.
    </p>
    <h3>Guidelines</h3>
    <ol>
      <li>
        The closer to the origin of the data the link to the source is, the
        better. For example, if an article cites a data point from a research
        paper, the link should be to the paper itself and not to the article.
      </li>
      <li>
        Discussions are not data. A discussion should be broken into its
        individual claims and points and added that way instead of offloading
        the discussion via a link.
      </li>
      <li>
        If a link contains multiple pieces of data, create multiple data items
        with the same source link to represent them.
      </li>
    </ol>

    <h2>Topics <dwd-anchor name="topics" /></h2>
    <h4>Topics represent common areas of debate.</h4>
    <p>
      Topics are general areas of debate. The description of a topic should be
      used to give neutral background information. Topics also contain links to
      sub-topics and key claims.
    </p>
    <p>
      The description of a topic can contain markdown-style links. For example,
      [Wikipedia](https://www.wikipedia.org/) will display as
      <a href="https://www.wikipedia.org/" target="_blank" rel="noopener"
        >Wikipedia</a
      >. Remember, these links should be neutral sources of background
      information only. Wikipedia tends to be perfect for this.
    </p>
    <h3>Guidelines</h3>
    <ol>
      <li>Topic descriptions should be as neutral as possible.</li>
      <li>
        Key claims should be the claims that represent the different sides of
        the topic's debate most effectively.
      </li>
    </ol>

    <h2>Items <dwd-anchor name="items" /></h2>
    <p>
      All three item types (claims, data, and topics) have some common
      functionality.
    </p>
    <h3>Starring <span class="fa-star far"></span></h3>
    <p>
      Star an item to express your support of it. Items are sorted by how many
      stars they have.
    </p>
    <h3>Watching <span class="fa-bell far"></span></h3>
    <p>
      Watching an item indicates that you want to be notified when it is
      changed. Starring an item will also watch it by default, but un-watching
      an item does not also un-star it.
    </p>
    <h3>Comments <span class="fa-comment far"></span></h3>
    <p>
      There is a simple comment system that can be used to discuss changes to an
      item. Please be courteous and respectful when commenting.
    </p>
    <h3>History <span class="fa-clock far"></span></h3>
    <p>
      All items have a full history of every change that has been made to them.
      Click on the history icon to see a list of all revisions that have been
      made. Click on a revision to see what it changed compared to the previous
      revision.
    </p>

    <h2>Logical Fallacies <dwd-anchor name="fallacies" /></h2>
    <p>
      It is very common in debates (especially verbal ones) for people to use
      arguments that contain well-known logical fallacies. They may look or feel
      relevant, but on closer inspection there is no logical connection between
      what they say and the correctness of the topic being discussed. This
      project allows users to flag these logic errors and display a warning
      about them. The supported fallacies are listed below.
    </p>

    <div v-for="[flag, data] in flags" :key="flag">
      <h3 :id="flag">{{ data.name }} <dwd-anchor :name="flag" /></h3>
      <p :class="$style.links">
        <span v-for="[title, url] in data.links" :key="title">
          <a :href="url" target="_blank" rel="noopener">{{ title }}</a>
        </span>
      </p>
      <p v-html="data.desc"></p>
    </div>
  </div>
</template>

<script>
import sortBy from 'lodash/fp/sortBy';

import DwdAnchor from '@/components/DwdAnchor.vue';
import { FlagData } from '@/common/flag';
import { map } from '@/utils';

export default {
  components: {
    DwdAnchor,
  },
  metaInfo: {
    title: 'Guide',
  },
  computed: {
    flags() {
      const flagList = map((v, k) => [k, v], FlagData);
      return sortBy(([, v]) => v.name, flagList);
    },
  },
};
</script>

<style lang="scss" module>
.guide {
  h2 {
    margin-top: 2.5rem;
  }

  ol,
  ul {
    margin: 1em 0;
  }
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
