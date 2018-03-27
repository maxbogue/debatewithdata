# API Data

This document describes the fields present in the API data format for items.
Fields with a `?` after their name are optional. If a condition appears in
parenthesis after the type, it is present iff that condition is met. `??` means
they are still optional even if the condition is met.

## Data Bundle

All API methods return a data object of this form. All fields are optional and
only set based on the specific request.

    // Main three are stores in the Vuex store client-side.
    topics: { [id]: Topic }
    claims: { [id]: Claim }
    sources: { [id]: Source }

    // Revision data works a bit differently.
    topicRevs: [TopicRev]
    claimRevs: [ClaimRev]
    sourceRevs: [SourceRev]

    id: String      // Present for add operations.

## Metadata

Metadata common for all items.

### All

Always present.

    id: String
    revId: String
    // Only set if deleted.
    deleted?: Boolean
    deleteMessage?: String

### Items

Present for whole items (not revisions).

    commentCount: Integer
    star: {
      count: Integer
      starred: Boolean
    }  // Not present for sources.

### Revisons

Present only for revisions.

    username: String
    createdAt: Date

## Data

Core data for each item type. These are the fields that should be used for
diffs and equality checks. None of these are set for deleted items.

### Topic

    title: String
    text: String
    subTopicIds: [String]
    claimIds: [String]

### Claim

    text: String
    flag?: String
    // Optional when sending to server.
    subClaimIds: { id: Boolean }
    sourceIds: { id: Boolean }
    // Only when sending to server.
    newSubClaims: [{...Claim, isFor: Boolean }]
    newSources: [{...Source, isFor: Boolean }]

### Source

    url: String
    text: String
    type: String (misc, article, research, authority)
    date?: Date
    institution?: String (type = research|authority)
    publication?: String (type = research|article)

## Misc

### Activity

    timestamp: Date
    username: String
    action: String (added, deleted, edited, commented on)
    type: String (topic, claim, source)
    id: String
