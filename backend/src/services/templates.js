function getProfileImageStyleHtml(theme = {}, defaults = {}) {
  const size = theme.profileImageSize !== undefined ? theme.profileImageSize : (defaults.size || 96);
  const shape = theme.profileImageShape || defaults.shape || 'circle';
  const borderWidth = theme.profileImageBorderWidth !== undefined ? theme.profileImageBorderWidth : (defaults.borderWidth !== undefined ? defaults.borderWidth : 2);
  const borderColor = theme.profileImageBorderColor || defaults.borderColor || '#ffffff';

  let borderRadius = '50%';
  if (shape === 'rounded-square') {
    borderRadius = '12px';
  } else if (shape === 'square') {
    borderRadius = '0px';
  } else if (shape === 'squircle') {
    borderRadius = '24px';
  }

  return `width: ${size}px; height: ${size}px; border-radius: ${borderRadius}; border: ${borderWidth}px ${borderWidth > 0 ? 'solid' : 'none'} ${borderColor}; object-fit: cover;`;
}

function renderCleanAts(data, imageBase64) {
  const { basics = {}, work = [], education = [], skills = [], projects = [], certifications = [], theme = {} } = data;
  return `
    <div class="p-8 max-w-[800px] mx-auto text-textcol text-sm">
      <!-- Header -->
      <div class="border-b-2 border-primary pb-4 mb-5 flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-extrabold text-primary tracking-tight uppercase">${basics.name || 'Your Name'}</h1>
          <h2 class="text-lg font-semibold text-secondary mt-1">${basics.label || 'Professional Title'}</h2>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2 font-medium">
            ${basics.email ? `<span>Email: ${basics.email}</span>` : ''}
            ${basics.phone ? `<span>Phone: ${basics.phone}</span>` : ''}
            ${basics.url ? `<span>Web: ${basics.url}</span>` : ''}
            ${basics.location ? `<span>Loc: ${basics.location}</span>` : ''}
          </div>
        </div>
        ${imageBase64 ? `
          <img src="${imageBase64}" style="${getProfileImageStyleHtml(theme, { size: 80, shape: 'rounded-square', borderWidth: 1, borderColor: '#e5e7eb' })}" />
        ` : ''}
      </div>

      <!-- Summary -->
      ${basics.summary ? `
        <div class="mb-5 page-break-avoid">
          <h3 class="text-sm font-bold uppercase tracking-wider text-primary border-b border-gray-200 pb-1 mb-2">Professional Summary</h3>
          <p class="text-gray-700 leading-relaxed text-xs">${basics.summary}</p>
        </div>
      ` : ''}

      <!-- Work Experience -->
      ${work.length > 0 ? `
        <div class="mb-5">
          <h3 class="text-sm font-bold uppercase tracking-wider text-primary border-b border-gray-200 pb-1 mb-3">Work Experience</h3>
          <div class="space-y-4">
            ${work.map(w => `
              <div class="page-break-avoid">
                <div class="flex justify-between items-start font-semibold text-xs text-gray-900">
                  <div>
                    <span class="text-secondary">${w.position}</span> at <span>${w.company}</span>
                  </div>
                  <div class="text-gray-500 text-[11px]">
                    ${w.startDate} - ${w.current ? 'Present' : (w.endDate || '')}
                  </div>
                </div>
                ${w.summary ? `<p class="text-gray-600 mt-1 text-xs leading-relaxed">${w.summary}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Education -->
      ${education.length > 0 ? `
        <div class="mb-5">
          <h3 class="text-sm font-bold uppercase tracking-wider text-primary border-b border-gray-200 pb-1 mb-3">Education</h3>
          <div class="space-y-3">
            ${education.map(edu => `
              <div class="page-break-avoid flex justify-between items-start text-xs">
                <div>
                  <div class="font-bold text-gray-900">${edu.studyType} in ${edu.area}</div>
                  <div class="text-gray-600">${edu.institution}</div>
                </div>
                <div class="text-gray-500 text-[11px] font-medium">
                  ${edu.startDate} - ${edu.endDate || ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Skills -->
      ${skills.length > 0 ? `
        <div class="mb-5 page-break-avoid">
          <h3 class="text-sm font-bold uppercase tracking-wider text-primary border-b border-gray-200 pb-1 mb-3">Skills</h3>
          <div class="flex flex-wrap gap-2">
            ${skills.map(s => `
              <span class="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-md font-medium">
                ${s.name}${s.keywords && s.keywords.length > 0 ? `: ${s.keywords.join(', ')}` : ''}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Projects -->
      ${projects.length > 0 ? `
        <div class="mb-5">
          <h3 class="text-sm font-bold uppercase tracking-wider text-primary border-b border-gray-200 pb-1 mb-3">Key Projects</h3>
          <div class="space-y-4">
            ${projects.map(p => `
              <div class="page-break-avoid">
                <div class="flex justify-between items-center text-xs font-bold text-gray-900">
                  <div>${p.name}</div>
                  ${p.url ? `<a href="${p.url}" class="text-primary text-[11px] underline font-medium">View Project</a>` : ''}
                </div>
                <p class="text-gray-600 mt-1 text-xs leading-relaxed">${p.description || ''}</p>
                ${p.keywords && p.keywords.length > 0 ? `
                  <div class="flex flex-wrap gap-1 mt-1">
                    ${p.keywords.map(kw => `<span class="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">${kw}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Certifications -->
      ${certifications.length > 0 ? `
        <div class="mb-5">
          <h3 class="text-sm font-bold uppercase tracking-wider text-primary border-b border-gray-200 pb-1 mb-3">Certifications</h3>
          <div class="grid grid-cols-2 gap-2 text-xs">
            ${certifications.map(c => `
              <div class="page-break-avoid border-l-2 border-primary pl-2.5 py-0.5">
                <div class="font-bold text-gray-900">${c.name}</div>
                <div class="text-gray-500 text-[11px]">${c.issuer} (${c.date || ''})</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderModernSidebar(data, imageBase64) {
  const { basics = {}, work = [], education = [], skills = [], projects = [], certifications = [], theme = {} } = data;
  return `
    <div class="flex min-h-[1100px] w-full text-textcol font-custom">
      <!-- Left Column Sidebar -->
      <div class="w-[32%] bg-secondary text-white p-6 flex flex-col gap-6 text-xs">
        ${imageBase64 ? `
          <div class="flex justify-center mb-2">
            <img src="${imageBase64}" style="${getProfileImageStyleHtml(theme, { size: 112, shape: 'circle', borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.2)' })}" class="shadow-md animate-fade-in" />
          </div>
        ` : ''}

        <!-- Contact Section -->
        <div>
          <h3 class="text-sm font-bold uppercase tracking-wider border-b border-white/20 pb-1 mb-3 text-primary">Contact</h3>
          <ul class="space-y-2.5 text-[11px] text-white/90">
            ${basics.email ? `<li class="break-all"><strong>Email:</strong><br/>${basics.email}</li>` : ''}
            ${basics.phone ? `<li><strong>Phone:</strong><br/>${basics.phone}</li>` : ''}
            ${basics.url ? `<li class="break-all"><strong>Web:</strong><br/>${basics.url}</li>` : ''}
            ${basics.location ? `<li><strong>Location:</strong><br/>${basics.location}</li>` : ''}
          </ul>
        </div>

        <!-- Skills Section -->
        ${skills.length > 0 ? `
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider border-b border-white/20 pb-1 mb-3 text-primary">Skills</h3>
            <div class="space-y-2">
              ${skills.map(s => `
                <div class="page-break-avoid">
                  <div class="font-semibold text-white/95">${s.name}</div>
                  ${s.keywords && s.keywords.length > 0 ? `
                    <div class="flex flex-wrap gap-1 mt-1">
                      ${s.keywords.map(kw => `<span class="bg-white/10 text-white/90 text-[10px] px-1.5 py-0.5 rounded">${kw}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Education Section -->
        ${education.length > 0 ? `
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider border-b border-white/20 pb-1 mb-3 text-primary">Education</h3>
            <div class="space-y-3.5 text-[11px]">
              ${education.map(edu => `
                <div class="page-break-avoid">
                  <div class="font-bold text-white">${edu.studyType} in ${edu.area}</div>
                  <div class="text-white/80">${edu.institution}</div>
                  <div class="text-white/50 text-[10px] mt-0.5">${edu.startDate} - ${edu.endDate || ''}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Right Column Main Body -->
      <div class="w-[68%] bg-white p-8 flex flex-col gap-6">
        <!-- Header -->
        <div class="border-b border-gray-100 pb-4">
          <h1 class="text-3xl font-extrabold text-secondary tracking-tight uppercase">${basics.name || 'Your Name'}</h1>
          <h2 class="text-md font-semibold text-primary mt-1 tracking-wide uppercase">${basics.label || 'Professional Title'}</h2>
        </div>

        <!-- Summary -->
        ${basics.summary ? `
          <div class="page-break-avoid">
            <h3 class="text-xs font-bold uppercase tracking-wider text-secondary border-l-4 border-primary pl-2 mb-2">Professional Summary</h3>
            <p class="text-gray-600 text-xs leading-relaxed">${basics.summary}</p>
          </div>
        ` : ''}

        <!-- Experience -->
        ${work.length > 0 ? `
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-secondary border-l-4 border-primary pl-2 mb-3">Work History</h3>
            <div class="space-y-4">
              ${work.map(w => `
                <div class="page-break-avoid text-xs">
                  <div class="flex justify-between items-start font-bold text-gray-900">
                    <div>${w.position} <span class="font-normal text-gray-500">at</span> ${w.company}</div>
                    <div class="text-[10px] text-gray-400 font-medium">${w.startDate} - ${w.current ? 'Present' : (w.endDate || '')}</div>
                  </div>
                  ${w.summary ? `<p class="text-gray-600 mt-1 text-xs leading-relaxed font-light">${w.summary}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Projects -->
        ${projects.length > 0 ? `
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-secondary border-l-4 border-primary pl-2 mb-3">Projects</h3>
            <div class="space-y-4">
              ${projects.map(p => `
                <div class="page-break-avoid text-xs">
                  <div class="flex justify-between items-center font-bold text-gray-900">
                    <span>${p.name}</span>
                    ${p.url ? `<a href="${p.url}" class="text-[10px] text-primary underline">Link</a>` : ''}
                  </div>
                  <p class="text-gray-600 mt-1 text-xs leading-relaxed font-light">${p.description || ''}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Certifications -->
        ${certifications.length > 0 ? `
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-secondary border-l-4 border-primary pl-2 mb-3">Certifications</h3>
            <div class="grid grid-cols-2 gap-2 text-xs">
              ${certifications.map(c => `
                <div class="page-break-avoid bg-gray-50 p-2 rounded border border-gray-100">
                  <div class="font-bold text-gray-900">${c.name}</div>
                  <div class="text-gray-500 text-[10px] mt-0.5">${c.issuer} | ${c.date || ''}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderPremiumCreative(data, imageBase64) {
  const { basics = {}, work = [], education = [], skills = [], projects = [], certifications = [], theme = {} } = data;
  return `
    <div class="max-w-[800px] mx-auto text-textcol text-xs font-custom bg-white">
      <!-- Creative Header Banner -->
      <div class="bg-primary text-white p-8 relative rounded-t-sm flex justify-between items-center gap-4">
        <div>
          <h1 class="text-3xl font-black uppercase tracking-widest text-white">${basics.name || 'Your Name'}</h1>
          <h2 class="text-sm font-semibold tracking-wider text-white/95 mt-1.5 uppercase">${basics.label || 'Professional Title'}</h2>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/80 mt-3 font-medium">
            ${basics.email ? `<span>✉ ${basics.email}</span>` : ''}
            ${basics.phone ? `<span>☎ ${basics.phone}</span>` : ''}
            ${basics.url ? `<span>🌐 ${basics.url}</span>` : ''}
            ${basics.location ? `<span>📍 ${basics.location}</span>` : ''}
          </div>
        </div>
        ${imageBase64 ? `
          <img src="${imageBase64}" style="${getProfileImageStyleHtml(theme, { size: 96, shape: 'rounded-square', borderWidth: 4, borderColor: 'rgba(255, 255, 255, 0.2)' })}" class="shadow-lg" />
        ` : ''}
      </div>

      <!-- Main Columns Grid -->
      <div class="grid grid-cols-12 gap-6 p-8">
        <!-- Left Main Column (65%) -->
        <div class="col-span-8 space-y-6">
          <!-- Summary -->
          ${basics.summary ? `
            <div class="page-break-avoid">
              <h3 class="text-sm font-bold uppercase tracking-wider text-primary border-b-2 border-primary/20 pb-1 mb-2">My Profile</h3>
              <p class="text-gray-600 leading-relaxed font-light">${basics.summary}</p>
            </div>
          ` : ''}

          <!-- Experience -->
          ${work.length > 0 ? `
            <div>
              <h3 class="text-sm font-bold uppercase tracking-wider text-primary border-b-2 border-primary/20 pb-1 mb-3">Professional Experience</h3>
              <div class="space-y-4">
                ${work.map(w => `
                  <div class="page-break-avoid">
                    <div class="flex justify-between items-center text-xs font-bold text-gray-900">
                      <span>${w.position}</span>
                      <span class="text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded">${w.startDate} - ${w.current ? 'Present' : (w.endDate || '')}</span>
                    </div>
                    <div class="text-[11px] text-gray-500 font-medium">${w.company}</div>
                    ${w.summary ? `<p class="text-gray-600 mt-1 text-xs leading-relaxed font-light">${w.summary}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Projects -->
          ${projects.length > 0 ? `
            <div>
              <h3 class="text-sm font-bold uppercase tracking-wider text-primary border-b-2 border-primary/20 pb-1 mb-3">Key Projects</h3>
              <div class="space-y-4">
                ${projects.map(p => `
                  <div class="page-break-avoid border-l-2 border-primary pl-3">
                    <div class="font-bold text-gray-900 text-xs">${p.name}</div>
                    <p class="text-gray-600 mt-0.5 text-xs font-light">${p.description || ''}</p>
                    ${p.url ? `<a href="${p.url}" class="text-[10px] text-primary underline font-medium mt-1 inline-block">View live project</a>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Right Sidebar Column (35%) -->
        <div class="col-span-4 space-y-6">
          <!-- Skills -->
          ${skills.length > 0 ? `
            <div>
              <h3 class="text-sm font-bold uppercase tracking-wider text-primary border-b-2 border-primary/20 pb-1 mb-3">Skills</h3>
              <div class="space-y-2 text-xs">
                ${skills.map(s => `
                  <div class="page-break-avoid">
                    <div class="font-bold text-gray-800">${s.name}</div>
                    <div class="text-gray-500 text-[10px] mt-0.5">${s.keywords ? s.keywords.join(', ') : ''}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Education -->
          ${education.length > 0 ? `
            <div>
              <h3 class="text-sm font-bold uppercase tracking-wider text-primary border-b-2 border-primary/20 pb-1 mb-3">Education</h3>
              <div class="space-y-3.5 text-xs">
                ${education.map(edu => `
                  <div class="page-break-avoid">
                    <div class="font-bold text-gray-800">${edu.studyType} in ${edu.area}</div>
                    <div class="text-gray-600 text-[11px]">${edu.institution}</div>
                    <div class="text-[10px] text-gray-400 mt-0.5">${edu.startDate} - ${edu.endDate || ''}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Certifications -->
          ${certifications.length > 0 ? `
            <div>
              <h3 class="text-sm font-bold uppercase tracking-wider text-primary border-b-2 border-primary/20 pb-1 mb-3">Certificates</h3>
              <div class="space-y-3">
                ${certifications.map(c => `
                  <div class="page-break-avoid text-xs bg-gray-50 p-2 rounded">
                    <div class="font-bold text-gray-800 text-[11px] leading-tight">${c.name}</div>
                    <div class="text-gray-500 text-[10px] mt-0.5">${c.issuer} | ${c.date || ''}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderProfessionalModern(data, imageBase64) {
  const { basics = {}, work = [], education = [], skills = [], projects = [], certifications = [], theme = {} } = data;
  return `
    <div class="min-h-[1123px] w-full text-[10px] text-gray-700 font-custom bg-white select-none flex flex-col">
      <!-- Dark Top Header -->
      <div class="bg-secondary text-white p-8 px-10 flex items-center gap-8 shrink-0">
        ${imageBase64 ? `
          <div class="relative shrink-0">
            <img 
              src="${imageBase64}" 
              style="${getProfileImageStyleHtml(theme, { size: 96, shape: 'circle', borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.2)' })}" 
              class="shadow-md" 
              alt="${basics.name || 'Profile Photo'}" 
            />
          </div>
        ` : ''}
        <div class="flex-1 min-w-0">
          <h1 class="text-3xl font-extrabold tracking-wide uppercase truncate">
            ${basics.name || 'Your Name'}
          </h1>
          <h2 class="text-xs font-medium tracking-widest text-white/80 mt-1.5 uppercase truncate">
            ${basics.label || 'Professional Title'}
          </h2>
        </div>
      </div>

      <!-- Two Columns Grid -->
      <div class="grid grid-cols-12 gap-8 p-10 flex-1">
        <!-- Left Column (Sidebar) - 35% -->
        <div class="col-span-4 space-y-6">
          <!-- Contact Section -->
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-primary border-b border-gray-200 pb-1 mb-3">
              Contact
            </h3>
            <ul class="space-y-2 text-[9px] text-gray-600">
              ${basics.phone ? `
                <li class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-primary shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <span>${basics.phone}</span>
                </li>
              ` : ''}
              ${basics.email ? `
                <li class="flex items-center gap-2 break-all">
                  <svg class="w-3.5 h-3.5 text-primary shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <span>${basics.email}</span>
                </li>
              ` : ''}
              ${basics.location ? `
                <li class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-primary shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span>${basics.location}</span>
                </li>
              ` : ''}
              ${basics.url ? `
                <li class="flex items-center gap-2 break-all">
                  <svg class="w-3.5 h-3.5 text-primary shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                  <span>${basics.url}</span>
                </li>
              ` : ''}
            </ul>
          </div>

          <!-- Skills Section -->
          ${skills.length > 0 ? `
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-primary border-b border-gray-200 pb-1 mb-3">
                Skills
              </h3>
              <ul class="space-y-2.5">
                ${skills.map(s => `
                  <li class="page-break-avoid">
                    <div class="flex items-start gap-1.5 font-semibold text-gray-800">
                      <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                      <span>${s.name}</span>
                    </div>
                    ${s.keywords && s.keywords.length > 0 ? `
                      <div class="text-gray-500 pl-2.5 mt-0.5 leading-relaxed text-[8.5px]">
                        ${s.keywords.join(', ')}
                      </div>
                    ` : ''}
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Certifications Section -->
          ${certifications.length > 0 ? `
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-primary border-b border-gray-200 pb-1 mb-3">
                Certifications
              </h3>
              <ul class="space-y-2.5">
                ${certifications.map(c => `
                  <li class="page-break-avoid flex items-start gap-1.5 text-gray-700">
                    <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                    <div class="min-w-0">
                      <div class="font-semibold text-gray-800 leading-tight truncate">${c.name}</div>
                      <div class="text-gray-400 text-[8.5px] mt-0.5">${c.issuer} ${c.date ? `| ${c.date}` : ''}</div>
                    </div>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>

        <!-- Right Column (Main Body) - 65% -->
        <div class="col-span-8 space-y-6 pl-2">
          <!-- About Me Section -->
          ${basics.summary ? `
            <div class="page-break-avoid">
              <h3 class="text-xs font-bold uppercase tracking-wider text-primary border-b border-gray-200 pb-1 mb-2.5">
                About Me
              </h3>
              <p class="text-gray-600 leading-relaxed font-light text-[9.5px]">
                ${basics.summary}
              </p>
            </div>
          ` : ''}

          <!-- Experience Section -->
          ${work.length > 0 ? `
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-primary border-b border-gray-200 pb-1 mb-3.5">
                Experience
              </h3>
              
              <!-- Timeline Container -->
              <div class="relative border-l border-gray-200 ml-1.5 pl-4 space-y-4">
                ${work.map(w => `
                  <div class="relative page-break-avoid">
                    <!-- Timeline Dot -->
                    <div class="absolute -left-[20.5px] top-[4px] w-2 h-2 rounded-full border border-white bg-primary shrink-0"></div>
                    
                    <div class="space-y-0.5">
                      <h4 class="text-[10.5px] font-bold text-gray-900 leading-tight">
                        ${w.position}
                      </h4>
                      <div class="flex justify-between items-baseline text-[9px]">
                        <span class="italic text-gray-650 font-medium">${w.company}</span>
                        <span class="text-gray-400 font-medium whitespace-nowrap">
                          ${w.startDate} - ${w.current ? 'Present' : (w.endDate || '')}
                        </span>
                      </div>
                    </div>
                    ${w.summary ? `
                      <p class="text-gray-500 text-[8.5px] leading-relaxed font-light mt-1.5">
                        ${w.summary}
                      </p>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Education Section -->
          ${education.length > 0 ? `
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-primary border-b border-gray-200 pb-1 mb-3.5">
                Education
              </h3>
              
              <!-- Timeline Container -->
              <div class="relative border-l border-gray-200 ml-1.5 pl-4 space-y-4">
                ${education.map(edu => `
                  <div class="relative page-break-avoid">
                    <!-- Timeline Dot -->
                    <div class="absolute -left-[20.5px] top-[4px] w-2 h-2 rounded-full border border-white bg-primary shrink-0"></div>
                    
                    <div class="space-y-0.5">
                      <h4 class="text-[10.5px] font-bold text-gray-900 leading-tight">
                        ${edu.studyType} in ${edu.area}
                      </h4>
                      <div class="flex justify-between items-baseline text-[9px]">
                        <span class="italic text-gray-650 font-medium">${edu.institution}</span>
                        <span class="text-gray-400 font-medium whitespace-nowrap">
                          ${edu.startDate} - ${edu.endDate || ''}
                        </span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Projects Section -->
          ${projects.length > 0 ? `
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-primary border-b border-gray-200 pb-1 mb-3.5">
                Projects
              </h3>
              
              <!-- Timeline Container -->
              <div class="relative border-l border-gray-200 ml-1.5 pl-4 space-y-4">
                ${projects.map(p => `
                  <div class="relative page-break-avoid">
                    <!-- Timeline Dot -->
                    <div class="absolute -left-[20.5px] top-[4px] w-2 h-2 rounded-full border border-white bg-primary shrink-0"></div>
                    
                    <div class="space-y-0.5">
                      <div class="flex justify-between items-center text-[10.5px] font-bold text-gray-900 leading-tight">
                        <span>${p.name}</span>
                        ${p.url ? `
                          <a 
                            href="${p.url}" 
                            target="_blank" 
                            rel="noreferrer" 
                            class="text-[8px] text-primary underline font-medium whitespace-nowrap ml-2"
                          >
                            Link
                          </a>
                        ` : ''}
                      </div>
                    </div>
                    ${p.description ? `
                      <p class="text-gray-500 text-[8.5px] leading-relaxed font-light mt-1">
                        ${p.description}
                      </p>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderPinkMaroonModern(data, imageBase64) {
  const { basics = {}, work = [], education = [], skills = [], projects = [], certifications = [], references = [], theme = {} } = data;

  const serifFont = "font-family: 'Lora', serif;";
  const sansFont = "font-family: 'Montserrat', sans-serif;";

  // Dynamically separate languages out of skills
  const languageSkill = skills.find(s => s.name?.toLowerCase().includes('language'));
  const otherSkills = skills.filter(s => !s.name?.toLowerCase().includes('language'));

  return `
    <div 
      class="flex min-h-[1123px] w-full text-[10px] text-gray-700 select-none bg-[#FAF4F0] relative overflow-hidden"
      style="${sansFont}"
    >
      <!-- Left Column (Sidebar) - 38% width, absolute vertical block -->
      <div class="w-[38%] shrink-0 relative flex flex-col min-h-full">
        <!-- Maroon background with diagonal clip path -->
        <div 
          class="absolute inset-0 bg-[#801f31] z-0"
          style="clip-path: polygon(0 0, 100% 160px, 100% 100%, 0 100%);"
        ></div>

        <!-- Content Layer (on top of background) -->
        <div class="relative z-10 p-6 px-7 pt-10 text-white flex flex-col gap-6">
          <!-- Profile Photo -->
          ${imageBase64 ? `
            <div class="flex justify-center mb-1">
              <img 
                src="${imageBase64}" 
                style="${getProfileImageStyleHtml(theme, { size: 112, shape: 'circle', borderWidth: 4, borderColor: '#ffffff' })}" 
                class="shadow-lg" 
                alt="${basics.name || 'Profile headshot'}" 
              />
            </div>
          ` : `<div style="height: ${theme.profileImageSize !== undefined ? theme.profileImageSize : 112}px;"></div>`}

          <!-- Name & Title -->
          <div class="text-center space-y-1.5 mt-2">
            <h1 
              class="text-2xl font-extrabold tracking-wide uppercase leading-tight"
              style="${serifFont}"
            >
              ${basics.name || 'Your Name'}
            </h1>
            <h2 
              class="text-[9px] font-medium tracking-widest text-white/90 uppercase"
            >
              ${basics.label || 'Professional Title'}
            </h2>
          </div>

          <!-- Contact Details -->
          <div class="mt-2">
            <h3 
              class="text-[11px] font-bold uppercase tracking-wider text-white border-b border-white/20 pb-0.5 mb-2.5"
              style="${serifFont}"
            >
              Contact
            </h3>
            <ul class="space-y-2 text-[8.5px] text-white/90">
              ${basics.phone ? `
                <li class="flex items-center gap-2">
                  <svg class="w-3 h-3 text-white shrink-0 inline align-middle mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <span>${basics.phone}</span>
                </li>
              ` : ''}
              ${basics.email ? `
                <li class="flex items-center gap-2 break-all">
                  <svg class="w-3 h-3 text-white shrink-0 inline align-middle mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <span>${basics.email}</span>
                </li>
              ` : ''}
              ${basics.location ? `
                <li class="flex items-center gap-2">
                  <svg class="w-3 h-3 text-white shrink-0 inline align-middle mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span>${basics.location}</span>
                </li>
              ` : ''}
              ${basics.url ? `
                <li class="flex items-center gap-2 break-all">
                  <svg class="w-3 h-3 text-white shrink-0 inline align-middle mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                  <span>${basics.url}</span>
                </li>
              ` : ''}
            </ul>
          </div>

          <!-- Skills Section -->
          ${otherSkills.length > 0 ? `
            <div>
              <h3 
                class="text-[11px] font-bold uppercase tracking-wider text-white border-b border-white/20 pb-0.5 mb-2.5"
                style="${serifFont}"
              >
                Skills
              </h3>
              <ul class="list-disc pl-4 space-y-1 text-[8.5px] text-white/95">
                ${otherSkills.map(s => {
                  if (s.keywords && s.keywords.length > 0) {
                    return s.keywords.map(kw => `
                      <li class="leading-tight">${kw}</li>
                    `).join('');
                  }
                  return `<li class="leading-tight">${s.name}</li>`;
                }).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Language Section -->
          ${languageSkill && languageSkill.keywords && languageSkill.keywords.length > 0 ? `
            <div>
              <h3 
                class="text-[11px] font-bold uppercase tracking-wider text-white border-b border-white/20 pb-0.5 mb-2.5"
                style="${serifFont}"
              >
                Language
              </h3>
              <ul class="list-disc pl-4 space-y-1 text-[8.5px] text-white/95">
                ${languageSkill.keywords.map(lang => `
                  <li class="leading-tight">${lang}</li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Certifications -->
          ${!languageSkill && certifications.length > 0 ? `
            <div>
              <h3 
                class="text-[11px] font-bold uppercase tracking-wider text-white border-b border-white/20 pb-0.5 mb-2.5"
                style="${serifFont}"
              >
                Certifications
              </h3>
              <ul class="list-disc pl-4 space-y-1 text-[8.5px] text-white/95">
                ${certifications.map(c => `
                  <li class="leading-tight">${c.name} (${c.issuer})</li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Right Column (Main Body) -->
      <div class="w-[62%] p-8 px-10 flex flex-col gap-5 select-none bg-[#FAF4F0]">
        
        <!-- About Me Section -->
        ${basics.summary ? `
          <div class="page-break-avoid mt-2">
            <h3 
              class="text-xs font-bold uppercase tracking-wider text-[#801f31] border-b border-[#801f31]/30 pb-0.5 mb-2.5"
              style="${serifFont}"
            >
              About Me
            </h3>
            <p class="text-gray-600 leading-relaxed font-light text-[9.5px]">
              ${basics.summary}
            </p>
          </div>
        ` : ''}

        <!-- Work Experience Section -->
        ${work.length > 0 ? `
          <div>
            <h3 
              class="text-xs font-bold uppercase tracking-wider text-[#801f31] border-b border-[#801f31]/30 pb-0.5 mb-3"
              style="${serifFont}"
            >
              Work Experience
            </h3>
            <div class="space-y-3.5">
              ${work.map(w => `
                <div class="page-break-avoid space-y-0.5">
                  <div class="flex justify-between items-baseline">
                    <span class="text-[10px] font-bold text-gray-900">${w.position}</span>
                    <span class="text-[8px] text-gray-400 font-semibold whitespace-nowrap">
                      ${w.startDate} - ${w.current ? 'Present' : (w.endDate || '')}
                    </span>
                  </div>
                  <div class="text-[8.5px] text-[#801f31] font-bold uppercase tracking-wide">${w.company}</div>
                  ${w.summary ? `
                    <p class="text-gray-500 text-[8.5px] leading-relaxed font-light mt-1">
                      ${w.summary}
                    </p>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Education Section -->
        ${education.length > 0 ? `
          <div>
            <h3 
              class="text-xs font-bold uppercase tracking-wider text-[#801f31] border-b border-[#801f31]/30 pb-0.5 mb-3"
              style="${serifFont}"
            >
              Education
            </h3>
            <div class="space-y-3.5">
              ${education.map(edu => `
                <div class="page-break-avoid space-y-0.5">
                  <div class="flex justify-between items-baseline">
                    <span class="text-[10px] font-bold text-gray-900">${edu.institution}</span>
                    <span class="text-[8px] text-gray-400 font-semibold whitespace-nowrap">
                      ${edu.startDate} - ${edu.endDate || ''}
                    </span>
                  </div>
                  <div class="text-[8.5px] text-[#801f31] font-bold uppercase tracking-wide">
                    ${edu.studyType} in ${edu.area}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Projects Section -->
        ${projects.length > 0 ? `
          <div>
            <h3 
              class="text-xs font-bold uppercase tracking-wider text-[#801f31] border-b border-[#801f31]/30 pb-0.5 mb-3"
              style="${serifFont}"
            >
              Projects
            </h3>
            <div class="space-y-3.5">
              ${projects.map(p => `
                <div class="page-break-avoid space-y-0.5">
                  <div class="flex justify-between items-center">
                    <span class="text-[10px] font-bold text-gray-900">${p.name}</span>
                    ${p.url ? `
                      <a 
                        href="${p.url}" 
                        target="_blank" 
                        rel="noreferrer" 
                        class="text-[8px] text-[#801f31] underline font-medium"
                      >
                        Link
                      </a>
                    ` : ''}
                  </div>
                  ${p.description ? `
                    <p class="text-gray-500 text-[8.5px] leading-relaxed font-light mt-0.5">
                      ${p.description}
                    </p>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- References Section -->
        ${references.length > 0 ? `
          <div>
            <h3 
              class="text-xs font-bold uppercase tracking-wider text-[#801f31] border-b border-[#801f31]/30 pb-0.5 mb-3"
              style="${serifFont}"
            >
              References
            </h3>
            <div class="grid grid-cols-2 gap-6">
              ${references.map(r => `
                <div class="page-break-avoid space-y-0.5 text-[8.5px]">
                  <h4 class="font-bold text-gray-900 text-[9.5px]">${r.name}</h4>
                  <div class="text-gray-600 font-medium leading-tight">${r.position} / ${r.company}</div>
                  ${(r.phone || r.email) ? `
                    <div class="text-gray-500 space-y-0.5 mt-1 text-[8px]">
                      ${r.phone ? `<div><span class="font-bold text-gray-700">Phone:</span> ${r.phone}</div>` : ''}
                      ${r.email ? `<div><span class="font-bold text-gray-700">Email:</span> ${r.email}</div>` : ''}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderBlackMinimalistStructural(data, imageBase64) {
  const { basics = {}, work = [], education = [], skills = [], projects = [], certifications = [], theme = {} } = data;
  return `
    <div class="p-10 text-xs text-gray-800 bg-white font-sans">
      <!-- Name and Title Header -->
      <div class="mb-8 pb-5 border-b border-gray-200">
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">
          ${basics.name || 'Your Name'}
        </h1>
        <h2 class="text-sm font-semibold tracking-wider text-gray-500 uppercase mt-1">
          ${basics.label || 'Professional Title'}
        </h2>
      </div>

      <!-- Structural Grid Columns -->
      <div class="grid grid-cols-12 gap-8">
        <!-- Left Sidebar Column (30% approx) -->
        <div class="col-span-4 space-y-6">
          <!-- Profile Image -->
          ${imageBase64 ? `
            <div class="flex justify-start mb-4">
              <img 
                src="${imageBase64}" 
                style="${getProfileImageStyleHtml(theme, { size: 100, shape: 'square', borderWidth: 1, borderColor: '#e5e7eb' })}" 
                class="shadow-sm object-cover"
                alt="profile"
              />
            </div>
          ` : ''}

          <!-- Contact Section -->
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1.5 mb-3">
              Contact
            </h3>
            <div class="space-y-2.5 text-[10.5px] text-gray-700">
              ${basics.phone ? `
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span>${basics.phone}</span>
                </div>
              ` : ''}
              ${basics.email ? `
                <div class="flex items-center gap-2 break-all">
                  <svg class="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span>${basics.email}</span>
                </div>
              ` : ''}
              ${basics.location ? `
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>${basics.location}</span>
                </div>
              ` : ''}
              ${basics.url ? `
                <div class="flex items-center gap-2 break-all">
                  <svg class="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                  </svg>
                  <span>${basics.url}</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Skills Section -->
          ${skills.length > 0 ? `
            <div class="space-y-3">
              <h3 class="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1.5 mb-3">
                Skills
              </h3>
              <div class="space-y-3">
                ${skills.map(s => `
                  <div class="page-break-avoid space-y-0.5">
                    <div class="font-bold text-[10.5px] text-gray-900">
                      ${s.name}
                    </div>
                    ${s.keywords && s.keywords.length > 0 ? `
                      <div class="text-gray-600 text-[10px] leading-relaxed">
                        ${s.keywords.join(', ')}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Certifications Section -->
          ${certifications.length > 0 ? `
            <div class="space-y-3">
              <h3 class="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1.5 mb-3">
                Certifications
              </h3>
              <div class="space-y-3">
                ${certifications.map(c => `
                  <div class="page-break-avoid text-[10px] space-y-0.5">
                    <div class="font-bold text-[10.5px] text-gray-900 leading-tight">
                      ${c.name}
                    </div>
                    <div class="text-gray-500 text-[9.5px]">
                      ${c.issuer} ${c.date ? `| ${c.date}` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Right Main Column (70% approx) -->
        <div class="col-span-8 space-y-6">
          <!-- About Me Section -->
          ${basics.summary ? `
            <div class="page-break-avoid">
              <h3 class="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1.5 mb-3">
                About Me
              </h3>
              <p class="text-gray-700 leading-relaxed text-[11px] font-normal">
                ${basics.summary}
              </p>
            </div>
          ` : ''}

          <!-- Experience Section -->
          ${work.length > 0 ? `
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1.5 mb-3">
                Experience
              </h3>
              <div class="border-l border-gray-200 pl-4 space-y-4">
                ${work.map(w => `
                  <div class="page-break-avoid space-y-1">
                    <div class="flex justify-between items-baseline">
                      <span class="font-bold text-[11px] text-gray-900 uppercase tracking-wide">
                        ${w.position}
                      </span>
                      <span class="text-[10px] text-gray-400 font-semibold whitespace-nowrap">
                        ${w.startDate} — ${w.current ? 'Present' : w.endDate}
                      </span>
                    </div>
                    <div class="text-[10px] text-gray-600 font-medium italic">
                      ${w.company}
                    </div>
                    ${w.summary ? `
                      <p class="text-gray-650 leading-relaxed text-[10.5px] font-normal">
                        ${w.summary}
                      </p>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Education Section -->
          ${education.length > 0 ? `
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1.5 mb-3">
                Education
              </h3>
              <div class="border-l border-gray-200 pl-4 space-y-4">
                ${education.map(edu => `
                  <div class="page-break-avoid space-y-1">
                    <div class="flex justify-between items-baseline">
                      <span class="font-bold text-[11px] text-gray-900 uppercase tracking-wide">
                        ${edu.studyType} in ${edu.area}
                      </span>
                      <span class="text-[10px] text-gray-400 font-semibold whitespace-nowrap">
                        ${edu.startDate} — ${edu.endDate}
                      </span>
                    </div>
                    <div class="text-[10px] text-gray-600 font-medium italic">
                      ${edu.institution}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Projects Section -->
          ${projects.length > 0 ? `
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1.5 mb-3">
                Projects
              </h3>
              <div class="border-l border-gray-200 pl-4 space-y-4">
                ${projects.map(p => `
                  <div class="page-break-avoid space-y-1">
                    <div class="flex justify-between items-baseline">
                      <span class="font-bold text-[11px] text-gray-900 uppercase tracking-wide">
                        ${p.name}
                      </span>
                      ${p.url ? `
                        <a
                          href="${p.url}"
                          target="_blank"
                          rel="noreferrer"
                          class="text-[10px] text-gray-900 underline font-semibold"
                        >
                          Link
                        </a>
                      ` : ''}
                    </div>
                    ${p.description ? `
                      <p class="text-gray-650 leading-relaxed text-[10.5px] font-normal">
                        ${p.description}
                      </p>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

module.exports = {
  renderCleanAts,
  renderModernSidebar,
  renderPremiumCreative,
  renderProfessionalModern,
  renderPinkMaroonModern,
  renderBlackMinimalistStructural
};
