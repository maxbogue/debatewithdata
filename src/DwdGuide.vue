<template>
<div>
  <h1>Guide</h1>
  <p>
    The goal of DebateWithData is to create a reference for debates that people
    have. Debates are represented by <strong>claims</strong>, which have
    <strong>points</strong> for and against them. Points can either be other
    claims or <strong>sources</strong>, which tie data sources into an
    argument.
  </p>
  <h2>Source<a href="#source"></a></h2>
  <p>
    A source on DWD is a source of <em>data</em>. It consists of a URL and a
    short description of the data that URL provides. The closer to the origin
    of the data, the better a source is. Primary sources like research papers
    or firsthand news articles are best. An article about a primary source with
    a citation is okay as well. Generally something like a Wikipedia article is
    not good as a source, though it can be a great way to gain background
    information.
  </p>
  <h2>Claim<a href="#claim"></a></h2>
  <p>
    In the real world, debates are often very broad in scope, which leads to a
    lot of confusion about exactly what positions each side is defending. To
    keep things cleaner on DWD, debates are distilled down into one or more
    claims. A claim is a clear, simple statement about the world. It is
    defended by points for it, and attacked by points against it.
  </p>
  <h2>Point<a href="#point"></a></h2>
  <p>A point for or against a claim can be one of three things:</p>
  <ul>
    <li>A link to a source.</li>
    <li>A link to another claim.</li>
    <li>A 'sub-claim' that only exists inside the claim.</li>
  </ul>
  <p>If a claim is the "what", the points are the "why" (or "why not").</p>
</div>
</template>

<script>
export default {};
</script>

<style scoped>
p {
  width: 600px;
}
</style>
