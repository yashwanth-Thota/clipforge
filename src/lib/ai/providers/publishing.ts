import type { PublishInput, PublishResult, PublishingProvider, PublishTarget } from "../types";
import { NotImplementedYet } from "../types";

/**
 * Auto-post adapters. These require per-platform app registration and review
 * (YouTube Data API upload scope, TikTok Content Posting API, Instagram Graph
 * API) which can take weeks — so they ship behind the FEATURE_AUTOPOST flag and
 * throw until wired up in Phase 5.
 */
class BasePublishingProvider implements PublishingProvider {
  constructor(readonly id: string, readonly target: PublishTarget, private phase = "Phase 5") {}
  async publish(_input: PublishInput): Promise<PublishResult> {
    throw new NotImplementedYet(`${this.target} auto-post`, this.phase);
  }
}

export class YouTubePublishingProvider extends BasePublishingProvider {
  constructor() {
    super("youtube", "youtube");
  }
}
export class TikTokPublishingProvider extends BasePublishingProvider {
  constructor() {
    super("tiktok", "tiktok");
  }
}
export class InstagramPublishingProvider extends BasePublishingProvider {
  constructor() {
    super("instagram", "instagram");
  }
}
