import { Controller, Get, Param, Query } from "@nestjs/common";
import { PublicService } from "./public.service";

// No guards: this is the anonymous delivery API consumed by the public site.
@Controller("public")
export class PublicController {
  constructor(private readonly pub: PublicService) {}

  @Get(":slug/site")
  site(@Param("slug") slug: string) {
    return this.pub.site(slug);
  }

  @Get(":slug/entries")
  list(
    @Param("slug") slug: string,
    @Query("type") type?: string,
    @Query("locale") locale?: string,
  ) {
    return this.pub.list(slug, { type, locale });
  }

  @Get(":slug/entry/:type/:entrySlug")
  one(
    @Param("slug") slug: string,
    @Param("type") type: string,
    @Param("entrySlug") entrySlug: string,
    @Query("locale") locale?: string,
  ) {
    return this.pub.one(slug, type, entrySlug, locale);
  }
}
