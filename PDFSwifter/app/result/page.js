// SSR result page for conversion outcomes and file preview
// Usage examples:
//   /result?status=uploaded&filename=myfile.pdf&tool=rotate-pdf&data=<base64>  (after upload, before conversion)
//   /result?status=success&filename=myfile.pdf&url=/api/download/abc123        (after conversion)
//   /result?status=error&message=Rotate%20failed                              (on error)

import ConversionResult from '@/features/results/ui/ConversionResult';
import FilePreviewWithConvert from '@/features/results/ui/FilePreviewWithConvert';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page({ searchParams }) {
  const params = await searchParams;

  const status = params?.status || 'error';
  const title = params?.title || undefined;
  const message = params?.message || undefined;
  const filename = params?.filename || undefined;
  const downloadUrl = params?.url || params?.downloadUrl || undefined;
  const sessionId = params?.session || undefined;
  const base64Data = params?.data || undefined;
  const tool = params?.tool || undefined;
  const contentType = params?.contentType || 'application/pdf';

  // For uploaded status with session ID, we need to get data from sessionStorage on client side
  // We'll pass the session ID to the component and let it handle the data retrieval
  if (status === 'uploaded' && sessionId) {
    return (
      <div className="min-h-[60vh] bg-gray-50">
        <FilePreviewWithConvert sessionId={sessionId} />
      </div>
    );
  }

  // If status is 'uploaded' with direct base64 data, show preview with convert button
  if (status === 'uploaded' && base64Data && tool) {
    return (
      <div className="min-h-[60vh] bg-gray-50">
        <FilePreviewWithConvert
          filename={filename}
          base64Data={base64Data}
          tool={tool}
          contentType={contentType}
        />
      </div>
    );
  }

  // Otherwise, show the standard conversion result
  const finalStatus = status === 'error' ? 'error' : 'success';
  
  return (
    <div className="min-h-[60vh] bg-gray-50">
      <ConversionResult
        status={finalStatus}
        title={title}
        message={message}
        filename={filename}
        downloadUrl={downloadUrl}
        base64Data={base64Data}
        contentType={contentType}
      />
    </div>
  );
}
