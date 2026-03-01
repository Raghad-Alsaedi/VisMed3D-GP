"use client";

interface PatientViewProps {
  reportText: string;
  bodyPart: string;
  clinicalIndication: string;
  technique: string;
  finding: string;
  impression: string;
  capturedImageUrl: string | null;
}

const PatientView = ({
  reportText,
  bodyPart,
  clinicalIndication,
  technique,
  finding,
  impression,
  capturedImageUrl,
}: PatientViewProps) => {
  if (!reportText) {
    return (
      <div className="w-full flex-1 text-white p-4 sm:p-5 md:p-6 rounded-md border border-white/20 overflow-auto bg-[#040A16]">
        <div className="text-center text-gray-400 text-sm sm:text-base">No report available</div>
      </div>
    );
  }

  const sectionTitleClass = "font-semibold text-white mb-1 sm:mb-2 text-xs sm:text-sm md:text-base";
  const sectionTextClass  = "leading-relaxed text-white/90 text-xs sm:text-sm md:text-base";

  return (
    <div className="w-full flex-1 text-white p-4 sm:p-5 md:p-6 rounded-md border border-white/20 overflow-auto bg-[#040A16]">
      <div className="space-y-4 sm:space-y-5">

        {bodyPart && (
          <div>
            <h3 className={sectionTitleClass}>Body Part:</h3>
            <p className={sectionTextClass}>{bodyPart}</p>
          </div>
        )}

        {clinicalIndication && (
          <div>
            <h3 className={sectionTitleClass}>Clinical Indication:</h3>
            <div
              className={`${sectionTextClass} prose-patient`}
              dangerouslySetInnerHTML={{ __html: clinicalIndication }}
            />
          </div>
        )}

        {technique && (
          <div>
            <h3 className={sectionTitleClass}>Technique:</h3>
            <div
              className={`${sectionTextClass} prose-patient`}
              dangerouslySetInnerHTML={{ __html: technique }}
            />
          </div>
        )}

        {finding && (
          <div>
            <h3 className={sectionTitleClass}>Finding:</h3>
            <div
              className={`${sectionTextClass} prose-patient`}
              dangerouslySetInnerHTML={{ __html: finding }}
            />
          </div>
        )}

        {impression && (
          <div>
            <h3 className={sectionTitleClass}>Impression:</h3>
            <div
              className={`${sectionTextClass} prose-patient`}
              dangerouslySetInnerHTML={{ __html: impression }}
            />
          </div>
        )}

        {capturedImageUrl && (
          <div>
            <h3 className={sectionTitleClass}>Attached Image:</h3>
            <img
              src={capturedImageUrl}
              alt="Report screenshot"
              className="max-w-full h-auto rounded border border-white/20"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientView;