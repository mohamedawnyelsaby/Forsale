interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <div>
      <h1>Product {id}</h1>
    </div>
  );
}
