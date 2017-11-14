<template>
<div class="narrow center">
	<h1>Project Status</h1>
  <p>DebateWithData is still in an early alpha stage.</p>

  <div class="block blue">
    <h2>Alpha Users</h2>
    <p>Alpha users can currently contribute the most to the project by:</p>
    <ul>
      <li>
        Creating a new claim based on a topic important to them and filling it
        out until they are satisfied with the representation of their argument,
        and reporting any issues they have in doing so.
      </li>
    </ul>
  </div>

  <div class="block green">
    <h2>Recent Changes</h2>
    <ul>
      <li>
        <strong>2017-11-13:</strong> Flag warnings are now more descriptive
        and link to a guide section containing more explanation.
      </li>
      <li>
        <strong>2017-11-10:</strong> Submit and cancel buttons now always
        visible when editing a claim.
      </li>
      <li>
        <strong>2017-11-09:</strong> Fixed bug where first action in a point
        input box didn't update the state.
      </li>
      <li>
        <strong>2017-11-09:</strong> Sub-points can now be flagged.
      </li>
      <li>
        <strong>2017-11-08:</strong> This status page is added to make things
        clearer for alpha users.
      </li>
      <li>
        <strong>2017-11-07:</strong> Major visual redesign that allows side
        colors for sub-points.
      </li>
    </ul>
  </div>

  <div class="block red">
    <h2>Known Bugs</h2>
    <ul>
      <li>
        None at the moment.
      </li>
    </ul>
  </div>

  <div class="block purple">
    <h2>Coming Improvements</h2>

    <h3>Topics</h3>
    <p>
      A new data type called topics will serve as a browsable way of getting to
      key claims.
    </p>
    <ul>
      <li>Each topic item would represent a political topic.</li>
      <li>
        Topics will link key claims representing the debate surrounding the
        topic.
      </li>
      <li>
        Might allow context links (e.g. Wikipedia articles) for further
        information?
      </li>
      <li>Might eventually require a higher trust tier to edit.</li>
    </ul>

    <h3>Comments</h3>
    <p>
      There is rudimentary comment support for claims and points, but it
      currently lacks any sort of notifcation mechanism or indicator that there
      are comments. This feature was intended to function similarly to a talk
      page, so it may need to be completely redone at some point. For now it
      should:
    </p>
    <ul>
      <li>Indicate whether there are any comments on the icon.</li>
      <li>
        Maybe notify interested parties (people who have starred, edited, or
        commented on the item).
      </li>
    </ul>

    <h3>Search</h3>
    <p>It&#39;s difficult to find things right now. There will be:</p>
    <ul>
      <li>
        A search feature that matches the text of sources, claims, and maybe
        points needs to be added.
      </li>
      <li>
        An autocomplete feature to suggest items to link while editing points
        instead of requiring users to copy/paste IDs.
      </li>
    </ul>

    <h3>History</h3>
    <p>
      Claims and sources currently store revision history as they are changed,
      but there is no way to view it. There will be:
    </p>
    <ul>
      <li>A history view that shows all the changes that have been made.</li>
      <li>
        A revision view that shows the differences between that revision and the
        previous one.
      </li>
    </ul>

    <h3>Enforcing Sources</h3>
    <p>
      Whether or not a claim needs more sources is unclear right now. There
      should either be a visual indication of how well-sourced a claim is, or a
      way to flag it as needing better sources, or both.
    </p>

    <h3>Raw Data</h3>
    <p>
      Since data is core to the mission of this project, there needs to be a way
      to display source data directly as a graph. Possibly this should also
      include a way to perform analysis of the data within the project.
    </p>

    <h3>User Data</h3>
    <p>
      What has been done by a specific user (including yourself) is currently
      not shown anywhere. There will be:
    </p>
    <ul>
      <li>A public user page showing contribution activity.</li>
      <li>
        A private section on your account page showing starred items for easy
        access.
      </li>
    </ul>
  </div>
</div>
</template>
