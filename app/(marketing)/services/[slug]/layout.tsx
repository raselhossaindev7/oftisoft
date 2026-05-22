import { jsonLdSchemas, constructMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { notFound } from "next/navigation";

// This would be fetched from API in production
async function getService(slug: string) {
  // Mock function - replace with actual API call
  return {
    title: "Service",
    description: "Service description",
    slug,
    features: [],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) {
    return constructMetadata({
      title: "Service Not Found",
      description: "The requested service could not be found.",
    });
  }

  return constructMetadata({
    title: `${service.title} | Software Development Service`,
    description: service.description,
    keywords: [
      service.title.toLowerCase(),
      "software service",
      "development service",
      "custom development",
    ],
  });
}

export default async function ServiceDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) {
    notFound();
  }

  const breadcrumbData = [
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: service.title, url: `/services/${service.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdSchemas.service(service)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdSchemas.breadcrumb(breadcrumbData)),
        }}
      />
      {children}
    </>
  );
}
