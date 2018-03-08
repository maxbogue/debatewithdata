This document describes the fields present in the API data format for items. Fields with a ? after their name are optional. If a condition appears in parenthesis after the type, it is present iff that condition is met. ?? means they are still optional even if the condition is met (iff -> only if).

# Common Metadata

Metadata common for all items.

## All

Always present.

    id: String
    revId: String
    // Only set if deleted.
    deleted?: Boolean?
    deleteMessage?: String?

## Items

Present for whole items (not revisions).

    commentCount: Integer
    // Not present for stars.
    star: {
      count: Integer
      starred: Boolean
    }

## Revisons

Present only for revisions.

    username: String
    createdAt: Date

# Core Data

Core data for each item type. These are the fields that should be used for diffs and equality checks.

## Topics

    title: String
    text: String
    subTopicIds: [String]
    claimIds: [String]

## Claims

    text: String
    flag??: String
    points: [
      { id: Point }, // Points for.
      { id: Point }, // Points against.
    ]

## Points

    type: String (claim, source, text, subclaim)
    text?: String (type = text|subclaim)
    flag??: String (type = text|subclaim)
    claimId?: String (type = claim)
    sourceId?: String (type = source)
    points?: [
      { id: Point }, // Points for.
      { id: Point }, // Points against.
    ] (type = subclaim)

## Sources

  url: String
  text: String
  type: String (misc, article, research, authority)
  date?: Date
  institution?: String (type = research|authority)
  publication?: String (type = research|article)

# Misc

## Activity

    timestamp: Date
    username: String
    action: String (added, deleted, edited, commented on)
    type: String (topic, claim, source)
    id: String
