import projectsData from '../data/projects.json';
import servicesData from '../data/services.json';
import teamMembersData from '../data/teamMembers.json';
import type {
  DescriptionBlock,
  Project,
  ProjectWithCleanDescription,
  Service,
  TeamMember,
} from '../types';
import { getGalleryFromPathAsync } from '../utils/gallery';
import { stripHtml } from '../utils/stripHtml';

type ProjectJsonRow = Omit<Project, 'gallery'> & {
  gallery?: string[];
  galleryFolder?: string;
};

const PROJECTS: ProjectJsonRow[] =
  projectsData as ProjectJsonRow[];

type ServiceFromJson = Omit<Service, 'description'> & {
  description?: DescriptionBlock[];
};

function resolveService(s: ServiceFromJson): Service {
  const blocks = s.blocks;
  if (blocks?.length) {
    const first = blocks[0];
    const { image, ...rest } = s;
    if (!first) {
      return {
        ...rest,
        description: s.description ?? [],
        blocks,
      };
    }
    const resolvedImage = image ?? first.image;
    const result: Service = {
      ...rest,
      description:
        s.description && s.description.length > 0
          ? s.description
          : first.description,
      blocks,
    };
    if (resolvedImage !== undefined)
      result.image = resolvedImage;
    return result;
  }

  const { image, ...rest } = s;
  const result: Service = {
    ...rest,
    description: s.description ?? [],
  };
  if (image !== undefined) result.image = image;
  return result;
}

const SERVICES: Service[] = (
  servicesData as ServiceFromJson[]
).map(resolveService);
const TEAM_MEMBERS: TeamMember[] =
  teamMembersData as TeamMember[];

function getCleanDescription(project: Project): string {
  const text =
    (project.description ??
      project.blocks?.[0]?.description ??
      [])[0]?.text ?? '';
  return stripHtml(text);
}

function sortProjectRows(
  rows: ProjectJsonRow[],
): ProjectJsonRow[] {
  return [...rows].sort((a, b) => {
    const ao = a.order ?? Number.POSITIVE_INFINITY;
    const bo = b.order ?? Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    return a.title.localeCompare(b.title);
  });
}

function mergeProjectBlocks(
  project: ProjectJsonRow,
): Project {
  const {
    galleryFolder: _galleryFolder,
    gallery: _jsonGallery,
    ...rest
  } = project;
  const merged: Project = { ...rest, gallery: [] };
  const firstBlock = project.blocks?.[0];
  if (firstBlock) {
    if (!merged.image && firstBlock.image)
      merged.image = firstBlock.image;
    if (
      (!merged.description ||
        merged.description.length === 0) &&
      firstBlock.description
    ) {
      merged.description = firstBlock.description;
    }
  }
  return merged;
}

function toProjectWithCleanDescription(
  project: Project,
): ProjectWithCleanDescription {
  return {
    ...project,
    cleanDescription: getCleanDescription(project),
  };
}

function loadListingProjects(
  limit?: number,
): ProjectWithCleanDescription[] {
  let rows = sortProjectRows(
    PROJECTS.filter(
      (project) => project.published !== false,
    ),
  );
  if (limit !== undefined) rows = rows.slice(0, limit);
  return rows.map((row) =>
    toProjectWithCleanDescription(mergeProjectBlocks(row)),
  );
}

export function getProjects(): ProjectWithCleanDescription[] {
  return loadListingProjects();
}

export function getFeaturedProjects(
  count: number,
): ProjectWithCleanDescription[] {
  return loadListingProjects(count);
}

async function resolveProjectGalleryAsync(
  row: ProjectJsonRow,
): Promise<Project> {
  const gallery =
    typeof row.galleryFolder === 'string' &&
    row.galleryFolder.trim() !== ''
      ? await getGalleryFromPathAsync(row.galleryFolder)
      : Array.isArray(row.gallery)
        ? row.gallery
        : [];

  return { ...mergeProjectBlocks(row), gallery };
}

export async function getProjectBySlugAsync(
  slug: string,
): Promise<Project | undefined> {
  const row = PROJECTS.find(
    (project) => project.slug === slug,
  );
  if (!row || row.published === false) return undefined;
  return resolveProjectGalleryAsync(row);
}

export function getPublishedProjectSlugs(): string[] {
  return PROJECTS.filter(
    (project) => project.published !== false,
  ).map((project) => project.slug);
}

export function getServices(): Service[] {
  return SERVICES.filter((s) => s.published !== false);
}

export function getServicesWithCleanDescription(): Array<
  Service & { cleanDescription: string }
> {
  return getServices().map((service) => ({
    ...service,
    cleanDescription: stripHtml(
      service.description[0]?.text ?? '',
    ),
  }));
}

export function getServiceBySlug(slug: string) {
  const service = SERVICES.find((s) => s.slug === slug);
  return service?.published !== false ? service : undefined;
}

export function getPublishedServiceSlugs(): string[] {
  return getServices().map((service) => service.slug);
}

export function getTeamMembers(): TeamMember[] {
  return [...TEAM_MEMBERS];
}
