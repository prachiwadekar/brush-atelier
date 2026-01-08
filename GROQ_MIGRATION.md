# Hybrid AI System: GPT-4o + LLaMA 3 8B

## Overview

The application now uses a **hybrid AI approach** combining the best of both worlds:

- **GPT-4o (OpenAI)**: Vision analysis and image understanding
- **LLaMA 3 8B (Groq)**: Coaching, reasoning, and text generation

This provides superior results compared to using Claude alone.

### What Changed

1. **AI Provider**: Switched from Anthropic Claude to Groq's LLaMA 3 8B model
2. **Dependencies**:
   - Removed: `@anthropic-ai/sdk`
   - Added: `groq-sdk`
3. **API Routes Updated**:
   - `/app/api/coaching-session/route.ts` - Now uses Groq for coaching plan generation
   - `/app/api/analyze-artwork/route.ts` - Now returns helpful message (vision not supported)

### Important Limitations

**LLaMA 3 8B does not support vision/image analysis**. This means:

- ✅ **Guided Sessions** still work - General coaching plans are created based on medium and skill level
- ❌ **Instant AI Critique** has limited functionality - Cannot analyze specific images
- ✅ **Color Mixing Guides** still work
- ✅ **Common Mistakes** coaching still works
- ✅ **Chat coaching** still works

### Setup Instructions

#### 1. Get Your Groq API Key

1. Go to [console.groq.com](https://console.groq.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it starts with `gsk_`)

#### 2. Update Environment Variables

Add the following to your `.env.local` file:

```bash
GROQ_API_KEY="your-groq-api-key-here"
```

You can remove the old Anthropic key:

```bash
# No longer needed
# ANTHROPIC_API_KEY=""
```

#### 3. Rebuild and Test

```bash
npm run build
npm run dev
```

### Performance Notes

**Groq Advantages:**
- ⚡ Extremely fast inference (much faster than Claude)
- 💰 More cost-effective
- 🔓 Open-source model (LLaMA 3)

**Groq Limitations:**
- 📸 No vision/image analysis capabilities
- 🎨 Cannot provide image-specific coaching (only general guidance)
- 📝 Slightly less nuanced responses compared to Claude

### Recommended Workflow

Since image analysis isn't available:

1. **For Guided Sessions**:
   - Upload your reference image (still stored for your portfolio)
   - Select your medium and skill level
   - Receive comprehensive general coaching for that medium

2. **For Best Results**:
   - Focus on the "Guided Session" feature
   - Use the step-by-step coaching plans
   - Follow the color mixing guides
   - Practice the techniques taught in each step

### Future Enhancements

To add vision capabilities back:

1. **Option A**: Use Groq's LLaMA 3.2 Vision models (when available)
2. **Option B**: Integrate a separate vision API (e.g., GPT-4 Vision, Anthropic Claude)
3. **Option C**: Use a multimodal model from another provider

### Troubleshooting

**Build fails with "GROQ_API_KEY environment variable is missing"**
- Make sure you've added `GROQ_API_KEY` to your `.env.local` file
- Restart your development server after adding environment variables

**Coaching sessions seem generic**
- This is expected - without vision, the AI provides general guidance
- The coaching is still valuable and follows best practices for the selected medium

**Want image analysis back?**
- Consider using a hybrid approach with a vision-capable API for the critique feature
- Keep Groq for text-based coaching (fast and cost-effective)
- Use Claude/GPT-4 Vision only for image analysis

## Support

For questions or issues, please refer to:
- [Groq Documentation](https://console.groq.com/docs)
- [LLaMA 3 Model Card](https://huggingface.co/meta-llama/Meta-Llama-3-8B)
